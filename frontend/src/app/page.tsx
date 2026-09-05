"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import mqtt, { MqttClient } from "mqtt";
import { UserProfile, VitalMetrics, HardwareConfig, GpsTrackingState } from "@/types/health";
import { getStoredProfile, getStoredTheme, saveStoredProfile, unauthenticatedProfile } from "@/utils/storage";
import { fetchLiveHardwareData, defaultHardwareConfig } from "@/utils/hardwareRelay";
import { addTelemetryRecord, purgeExpiredTelemetry } from "@/utils/telemetryBuffer";

import { Navbar } from "@/components/Navbar";
import { DashboardView } from "@/components/DashboardView";
import { HistoryView } from "@/components/HistoryView";
import { AlertsView } from "@/components/AlertsView";
import { TelemetryDrawer } from "@/components/TelemetryDrawer";
import { MetricDetailModal, MetricDetailData } from "@/components/MetricDetailModal";
import { EarlyWarningModal, EarlyWarningItem, DisasterAlert } from "@/components/EarlyWarningModal";
import { BottomNav } from "@/components/BottomNav";
import { LoginPage } from "@/components/LoginPage";

const MQTT_BROKER_URL = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || "wss://broker.hivemq.com";
const MQTT_BROKER_PORT = process.env.NEXT_PUBLIC_MQTT_BROKER_PORT || "8884";
const PRIMARY_BROKER = `${MQTT_BROKER_URL.replace(/\/$/, "")}:${MQTT_BROKER_PORT}/mqtt`;
const TOPIC = "kps_playz/sih/healthdata";
const DISASTER_TOPIC = "kps_playz/sih/disaster_feed";

const initialVitals: VitalMetrics = {
  hr: "--",
  hrv: "--",
  spo2: "--",
  temp: "--",
  fingerPresent: 0,
  steps: 0,
  distanceKm: 0,
  calories: 0,
  dataSource: "Not Connected",
};

const initialGpsTracking: GpsTrackingState = {
  path: [],
  totalDistanceMeters: 0,
  steps: 0,
};

const distanceBetweenPoints = (first: GeolocationCoordinates, second: GeolocationCoordinates) => {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = ((second.latitude - first.latitude) * Math.PI) / 180;
  const longitudeDelta = ((second.longitude - first.longitude) * Math.PI) / 180;
  const latitudeOne = (first.latitude * Math.PI) / 180;
  const latitudeTwo = (second.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export default function Home() {
  const [user, setUser] = useState<UserProfile>(unauthenticatedProfile);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [vitals, setVitals] = useState<VitalMetrics>(initialVitals);
  const [gpsTracking, setGpsTracking] = useState<GpsTrackingState>(initialGpsTracking);
  const [hwConfig, setHwConfig] = useState<HardwareConfig>(defaultHardwareConfig);

  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "alerts" | "profile">("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  
  // Modals & Drawers State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [connectionStatusVisible, setConnectionStatusVisible] = useState(false);
  const [activeMetricModal, setActiveMetricModal] = useState<MetricDetailData | null>(null);
  const warningSignatureRef = useRef("");
  const [disasterAlert, setDisasterAlert] = useState<DisasterAlert | null>(null);
  const [consciousnessCheckOpen, setConsciousnessCheckOpen] = useState(false);
  const [consciousnessCountdown, setConsciousnessCountdown] = useState(15);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [fallDetected, setFallDetected] = useState(false);
  const [sosMutedUntil, setSosMutedUntil] = useState(0);

  // MQTT Connection State
  const [mqttStatus, setMqttStatus] = useState<"connected" | "connecting" | "error" | "reconnecting">("connecting");
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  const [storageCountdown, setStorageCountdown] = useState("71h 59m 59s");
  const [rawStorageBytes, setRawStorageBytes] = useState(0);
  const [distilledStorageBytes, setDistilledStorageBytes] = useState(1024);
  const clientRef = useRef<MqttClient | null>(null);
  const fallSpikeAtRef = useRef<number | null>(null);
  const fallLowMotionSinceRef = useRef<number | null>(null);
  const fallAlertedRef = useRef(false);

  // Initial local storage hydration
  useEffect(() => {
    const hydrationTimeout = window.setTimeout(() => {
      const savedUser = getStoredProfile();
      if (savedUser) {
        setUser(savedUser);
        setIsLoggedIn(savedUser.isLoggedIn);
      }
      setTheme(getStoredTheme());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimeout);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").then(async () => {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: "CHECK_CONNECTION" });
      if ("sync" in registration) {
        try {
          await (registration as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          }).sync.register("health-companion-telemetry");
        } catch {
          // Background Sync is optional on some mobile browsers.
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn || typeof navigator === "undefined" || !navigator.geolocation) return;

    let previousPosition: GeolocationPosition | null = null;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy > 25) return;

        const movementMeters = previousPosition
          ? distanceBetweenPoints(previousPosition.coords, position.coords)
          : 0;
        previousPosition = position;

        if (movementMeters > 0 && (movementMeters < 3 || movementMeters > 50)) return;

        setGpsTracking((previous) => {
          const totalDistanceMeters = previous.totalDistanceMeters + movementMeters;
          const nextPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
          };

          return {
            path: [...previous.path, nextPoint].slice(-100),
            totalDistanceMeters,
            steps: Math.floor(totalDistanceMeters / 0.762),
          };
        });
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isLoggedIn]);

  useEffect(() => {
    const storageKey = "startTime";
    const storedStartTime = localStorage.getItem(storageKey);
    const startTime = storedStartTime ? Number(storedStartTime) : Date.now();

    if (!storedStartTime) localStorage.setItem(storageKey, String(startTime));

    const updateCountdown = () => {
      const remainingMs = Math.max(0, 259200000 - (Date.now() - startTime));
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setStorageCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncStorageStats = async () => {
      const stats = await purgeExpiredTelemetry();
      if (isMounted) setRawStorageBytes(stats.bytes);
    };

    void syncStorageStats();
    const cleanupInterval = setInterval(() => {
      void syncStorageStats();
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(cleanupInterval);
    };
  }, []);

  // Theme Toggle Handler
  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("sih_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  };

  const handleShowConnectionStatus = () => {
    setConnectionStatusVisible(true);
    window.setTimeout(() => setConnectionStatusVisible(false), 2000);
  };

  // Auth Handlers
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsLoggedIn(true);
    saveStoredProfile(profile);
  };

  const handleLogout = () => {
    const loggedOutProfile = { ...user, isLoggedIn: false };
    setUser(loggedOutProfile);
    setIsLoggedIn(false);
    saveStoredProfile(loggedOutProfile);
  };

  // Handle incoming raw payload from ESP32 MQTT topic ("HR,SpO2,Temp,Finger")
  const handleIncomingPayload = useCallback((payloadStr: string) => {
    setLastPayload(payloadStr);
    void addTelemetryRecord(payloadStr)
      .then((payloadBytes) => setRawStorageBytes((currentBytes) => currentBytes + payloadBytes))
      .catch(() => undefined);
    setDistilledStorageBytes((currentBytes) => currentBytes + 2);
    const data = payloadStr.trim().split(",");
    
    if (data.length >= 4) {
      const finger = data[3] === "1" ? 1 : 0;
      const motionLevel = data[4] !== undefined ? parseFloat(data[4]) : 0;
      const motionTimestamp = Date.now();

      if (motionLevel > 15.0) {
        fallSpikeAtRef.current = motionTimestamp;
        fallLowMotionSinceRef.current = null;
        fallAlertedRef.current = false;
      } else if (fallSpikeAtRef.current !== null) {
        if (motionLevel < 0.5) {
          fallLowMotionSinceRef.current ??= motionTimestamp;
          if (
            !fallAlertedRef.current &&
            fallLowMotionSinceRef.current !== null &&
            motionTimestamp - fallLowMotionSinceRef.current >= 5000
          ) {
            fallAlertedRef.current = true;
            setFallDetected(true);
          }
        } else {
          fallLowMotionSinceRef.current = null;
        }
      }
      if (finger === 1) {
        const rawHr = parseFloat(data[0]);
        const rawSpo2 = parseFloat(data[1]);
        const rawTemp = parseFloat(data[2]);

        setVitals((prev) => ({
          ...prev,
          hr: !isNaN(rawHr) && rawHr > 0 ? rawHr : "--",
          spo2: !isNaN(rawSpo2) && rawSpo2 > 0 ? rawSpo2 : "--",
          temp: !isNaN(rawTemp) && rawTemp > 0 ? rawTemp : "--",
          hrv: !isNaN(rawHr) && rawHr > 0 ? Math.round(70 - (rawHr - 70) * 0.4) : "--",
          motionLevel,
          steps: motionLevel > 2.0 ? prev.steps + 1 : prev.steps,
          calories: motionLevel > 2.0 ? Math.round((prev.steps + 1) * 0.04) : prev.calories,
          fingerPresent: 1,
          dataSource: "HiveMQ WebSocket Stream",
        }));
      } else {
        const rawTemp = parseFloat(data[2]);
        setVitals((prev) => ({
          ...prev,
          hr: "--",
          spo2: "--",
          temp: !isNaN(rawTemp) && rawTemp > 0 ? rawTemp : "--",
          motionLevel: 0,
          fingerPresent: 0,
          dataSource: "HiveMQ WebSocket Stream",
        }));
      }
    }
  }, []);

  // Connect HiveMQ MQTT Broker over WebSocket
  const connectMqtt = useCallback(() => {
    if (typeof window === "undefined") return;
    setMqttStatus("connecting");
    if (clientRef.current) clientRef.current.end(true);

    try {
      const client = mqtt.connect(PRIMARY_BROKER);
      clientRef.current = client;

      client.on("connect", () => {
        setMqttStatus("connected");
        client.subscribe(TOPIC, (err) => {
          if (err) console.error("[MQTT] Subscribe error:", err);
        });
        client.subscribe(DISASTER_TOPIC, (err) => {
          if (err) console.error("[MQTT] Disaster subscribe error:", err);
        });
      });

      client.on("message", (topic, message) => {
        if (topic === TOPIC) {
          handleIncomingPayload(message.toString());
        } else if (topic === DISASTER_TOPIC) {
          try {
            const payload = JSON.parse(message.toString()) as DisasterAlert & { type?: string };
            if (payload.type === "CLEAR" || payload.type === "RESOLVED") {
              setDisasterAlert(null);
            } else if (payload.type && payload.severity && payload.instruction) {
              setDisasterAlert(payload);
            }
          } catch {
            console.error("[MQTT] Invalid disaster payload");
          }
        }
      });

      client.on("error", (err) => {
        setMqttStatus("error");
      });
      client.on("reconnect", () => setMqttStatus("reconnecting"));
      client.on("close", () => setMqttStatus("error"));
    } catch (err) {
      setMqttStatus("error");
    }
  }, [handleIncomingPayload]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "BACKGROUND_CONNECTION_READY") {
        connectMqtt();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    return () => navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
  }, [connectMqtt]);

  // Main Effect
  useEffect(() => {
    const connectionTimeout = window.setTimeout(connectMqtt, 0);

    const interval = setInterval(async () => {
      if (!clientRef.current || !clientRef.current.connected) {
        const liveData = await fetchLiveHardwareData(hwConfig);
        if (liveData && liveData.fingerPresent === 1) {
          setVitals(liveData);
        }
      }
    }, 1500);

    return () => {
      window.clearTimeout(connectionTimeout);
      clearInterval(interval);
      if (clientRef.current) clientRef.current.end(true);
    };
  }, [connectMqtt, hwConfig]);

  const handlePublishTestPayload = (payloadStr: string) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish(TOPIC, payloadStr);
    }
    handleIncomingPayload(payloadStr);
  };

  const activeWarnings = useMemo(() => {
    const warnings: EarlyWarningItem[] = [];
    const numHr = typeof vitals.hr === "number" ? vitals.hr : parseFloat(String(vitals.hr));
    const numSpo2 = typeof vitals.spo2 === "number" ? vitals.spo2 : parseFloat(String(vitals.spo2));
    const numTemp = typeof vitals.temp === "number" ? vitals.temp : parseFloat(String(vitals.temp));
    const temperatureThreshold = disasterAlert?.type === "HEATWAVE" ? 37.5 : 38.0;
    const hasValidVitals = Number.isFinite(numHr) && Number.isFinite(numSpo2) && Number.isFinite(numTemp);
    const hasCriticalVitals = vitals.fingerPresent === 1 && hasValidVitals && (
      Number(numHr) > 120 ||
      Number(numHr) < 50 ||
      Number(numSpo2) < 92 ||
      Number(numTemp) > temperatureThreshold
    );

    if (fallDetected) {
      warnings.unshift({
        type: "fall",
        title: "CRITICAL FALL DETECTED",
        message: "High-impact motion was followed by 5 seconds of near-zero motion.",
        value: "MPU6050",
      });
    }

    if (hasCriticalVitals) {
      if (numHr > 120) {
        warnings.push({ type: "hr", title: "High Heart Rate", message: "Heart rate exceeded 120 BPM.", value: `${numHr} bpm` });
      } else if (numHr < 50) {
        warnings.push({ type: "hr", title: "Low Heart Rate", message: "Heart rate dropped below 50 BPM.", value: `${numHr} bpm` });
      }

      if (numSpo2 < 92) {
        warnings.push({ type: "spo2", title: "Low Blood Oxygen", message: "SpO2 dropped below 92%.", value: `${numSpo2}%` });
      }

      if (numTemp > temperatureThreshold) {
        warnings.push({ type: "temp", title: "High Skin Temperature", message: `Skin temperature exceeded ${temperatureThreshold}°C.`, value: `${numTemp} °C` });
      }
    }

    return warnings;
  }, [vitals, disasterAlert, fallDetected]);

  useEffect(() => {
    const nextSignature = activeWarnings.map((warning) => warning.type).join("|");

    if (activeWarnings.length === 0) {
      warningSignatureRef.current = "";
      return;
    }

    if (!sosDispatched && Date.now() >= sosMutedUntil && nextSignature !== warningSignatureRef.current) {
      warningSignatureRef.current = nextSignature;
      const warningTimeout = window.setTimeout(() => {
        setConsciousnessCountdown(15);
        setConsciousnessCheckOpen(true);
      }, 0);
      return () => window.clearTimeout(warningTimeout);
    }
  }, [activeWarnings, sosDispatched, sosMutedUntil]);

  const dispatchSos = () => {
    setConsciousnessCheckOpen(false);
    setSosDispatched(true);

    const emergencyPhone = user.emergencyContactPhone.trim();
    if (emergencyPhone) {
      const phoneNumber = emergencyPhone.replace(/[^\d+]/g, "");
      const vitalSummary = activeWarnings.map((warning) => `${warning.title}: ${warning.value}`).join("; ") || "Vitals critical";
      const smsUri = `sms:${phoneNumber}?body=${encodeURIComponent(`SOS! I require help. Location: ${currentLocation}. ${vitalSummary}.`)}`;
      const smsLink = document.createElement("a");
      smsLink.href = smsUri;
      smsLink.click();
    }
  };

  useEffect(() => {
    if (!consciousnessCheckOpen || sosDispatched) return;

    const countdownInterval = setInterval(() => {
      setConsciousnessCountdown((currentCountdown) => {
        if (currentCountdown <= 1) {
          dispatchSos();
          return 0;
        }
        return currentCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [consciousnessCheckOpen, sosDispatched, user.emergencyContactPhone]);

  const handleCancelConsciousnessCheck = () => {
    setConsciousnessCheckOpen(false);
    setConsciousnessCountdown(15);
    setFallDetected(false);
    fallSpikeAtRef.current = null;
    fallLowMotionSinceRef.current = null;
    fallAlertedRef.current = false;
    setSosMutedUntil(Date.now() + 120000);
    window.setTimeout(() => {
      setSosMutedUntil(0);
      warningSignatureRef.current = "";
    }, 120000);
  };

  const handleSendSos = () => {
    dispatchSos();
  };

  const handleSaveEmergencyPhone = (phone: string) => {
    setUser((currentUser) => {
      const updatedUser = { ...currentUser, emergencyContactPhone: phone };
      saveStoredProfile(updatedUser);
      return updatedUser;
    });
  };

  const hasWarning = activeWarnings.length > 0;
  const showModal = Boolean(disasterAlert) || consciousnessCheckOpen || (sosDispatched && hasWarning);

  // Render Login page if not authenticated
  if (!isHydrated || !isLoggedIn) {
    return (
      <LoginPage
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const isHardwareConnected = vitals.fingerPresent === 1 && vitals.hr !== "--";
  const currentLocation = gpsTracking.path.length > 0
    ? `${gpsTracking.path[gpsTracking.path.length - 1].latitude.toFixed(6)}, ${gpsTracking.path[gpsTracking.path.length - 1].longitude.toFixed(6)}`
    : "GPS location unavailable";

  return (
    <div className={`whoop-shell min-h-screen pb-24 font-sans antialiased transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white" 
        : "bg-slate-50 text-slate-900 selection:bg-cyan-600 selection:text-white"
    }`}>
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col px-4 sm:px-5">
        {/* Navigation Bar */}
        <Navbar
          mqttConnected={isHardwareConnected}
          onOpenTelemetryModal={() => setIsDrawerOpen(true)}
          onShowConnectionStatus={handleShowConnectionStatus}
          onOpenProfile={() => setActiveTab("profile")}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {connectionStatusVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 px-8 py-6 shadow-2xl">
              <span className={`text-lg font-bold tracking-wider ${isHardwareConnected ? "text-emerald-400" : "text-rose-400"}`}>
                {isHardwareConnected ? "CONNECTED" : "NOT CONNECTED"}
              </span>
            </div>
          </div>
        )}

        {/* View Switcher based on Active Tab */}
        <main className="flex-1 space-y-6 pt-2">
          {activeTab === "dashboard" && (
            <DashboardView
              userName={user.name}
              hr={vitals.hr}
              spo2={vitals.spo2}
              temp={vitals.temp}
              hrv={vitals.hrv}
              steps={gpsTracking.steps}
              calories={gpsTracking.steps * 0.04}
              fingerPresent={vitals.fingerPresent}
              hasWarning={hasWarning}
              warningMessage={activeWarnings[0]?.message}
              mqttConnected={isHardwareConnected}
              onOpenMetricDetail={setActiveMetricModal}
              onOpenTelemetryConsole={() => setIsDrawerOpen(true)}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              storageCountdown={storageCountdown}
              rawStorageBytes={rawStorageBytes}
              distilledStorageBytes={distilledStorageBytes}
            />
          )}

          {activeTab === "alerts" && (
            <AlertsView
              activeWarnings={activeWarnings}
              sosDispatched={sosDispatched}
              emergencyPhone={user.emergencyContactPhone}
              currentLocation={currentLocation}
              onSaveEmergencyPhone={handleSaveEmergencyPhone}
            />
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-6 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800/80 shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/20">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">{user.name || "User"}</h2>
                    <p className="text-sm text-slate-400">{user.age || "-"} Yrs • {user.gender || "-"} • {user.bloodGroup || "-"}</p>
                    <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {isHardwareConnected ? "HiveMQ Ring Connected" : "Searching HiveMQ Telemetry..."}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                    <span className="text-xs text-slate-400">Height / Weight</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{user.heightCm || "-"} cm / {user.weightKg || "-"} kg</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                    <span className="text-xs text-slate-400">BMI</span>
                    <p className="font-semibold text-slate-200 mt-0.5">22.2 (Normal)</p>
                  </div>
                </div>

                <div className="pt-2 flex space-x-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab as "dashboard" | "history" | "alerts" | "profile")}
        />

        {/* High-Priority Center Screen Emergency Alert Modal */}
        {showModal && (
          <EarlyWarningModal
            warnings={activeWarnings}
            disasterAlert={disasterAlert}
            countdown={consciousnessCountdown}
            sosDispatched={sosDispatched}
            emergencyPhone={user.emergencyContactPhone}
            onDismissDisasterAlert={() => setDisasterAlert(null)}
            onCancelSos={handleCancelConsciousnessCheck}
            onSendSos={handleSendSos}
          />
        )}

        {/* Telemetry Debug Drawer */}
        <TelemetryDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          mqttStatus={isHardwareConnected ? "connected" : "connecting"}
          lastPayload={lastPayload || ""}
          topic={TOPIC}
          brokerUrl={PRIMARY_BROKER}
          onPublishTestPayload={handlePublishTestPayload}
          onReconnect={connectMqtt}
        />

        <MetricDetailModal
          data={activeMetricModal}
          onClose={() => setActiveMetricModal(null)}
        />
      </div>
    </div>
  );
}
