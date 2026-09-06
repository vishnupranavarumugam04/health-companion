"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { HeaderSection } from "./HeaderSection";
import { MetricsGrid } from "./MetricsGrid";
import { WhoopMonitorPanel } from "./WhoopMonitorPanel";
import { SamsungGalaxyRings } from "./SamsungGalaxyRings";
import { MetricDetailData } from "./MetricDetailModal";
import { getDecryptedTelemetryRecords } from "@/utils/telemetryBuffer";
import { useHealthNotifications } from "../hooks/useHealthNotifications";
import { ThermometerSun, Droplets, Wind } from "lucide-react";

type GpsStatus =
  | { state: "searching" }
  | { state: "active"; accuracy: number; distance: number }
  | { state: "error"; message: string };

const gpsDistanceBetween = (
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) => {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = ((second.latitude - first.latitude) * Math.PI) / 180;
  const longitudeDelta = ((second.longitude - first.longitude) * Math.PI) / 180;
  const firstLatitude = (first.latitude * Math.PI) / 180;
  const secondLatitude = (second.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

interface DashboardViewProps {
  userName: string;
  hr: string | number;
  spo2: string | number;
  temp: string | number;
  hrv: string | number;
  fingerPresent: number;
  hasWarning: boolean;
  warningMessage?: string | null;
  mqttConnected: boolean;
  onOpenMetricDetail: (metric: MetricDetailData) => void;
  onOpenTelemetryConsole: () => void;
  envTemp?: string | number;
  envHumidity?: string | number;
  airQuality?: string | number;
  hardwareSteps?: number;
  hardwareActivity?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  hr,
  spo2,
  temp,
  hrv,
  fingerPresent,
  hasWarning,
  warningMessage,
  mqttConnected,
  onOpenMetricDetail,
  onOpenTelemetryConsole,
  envTemp = "--",
  envHumidity = "--",
  airQuality = "--",
  hardwareSteps,
  hardwareActivity,
}) => {
  const [derivedHrv, respRate, stress] = useMemo((): [number | string, number | string, string] => {
    if (fingerPresent === 0 || hr === "--") return ["--", "--", "--"];

    const numericHr = Number(hr);
    const calculatedHrv = Math.floor(120 - numericHr);
    const calculatedRespRate = Math.floor(numericHr / 5);

    return [
      Math.max(20, Math.min(120, calculatedHrv)),
      Math.max(12, Math.min(25, calculatedRespRate)),
      numericHr > 95 ? "High" : numericHr > 75 ? "Moderate" : "Low",
    ];
  }, [hr, fingerPresent]);
  const [strain, setStrain] = useState(4.0);
  const [recovery, setRecovery] = useState<number | string>("--");
  const [sleep, setSleep] = useState("--");
  const [gpsSteps, setGpsSteps] = useState(0);
  const [gpsDistance, setGpsDistance] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>({ state: "searching" });
  const [gpsActivityStatus, setGpsActivityStatus] = useState<"REST" | "ACTIVE" | "HIGH">("REST");
  const [activeTab, setActiveTab] = useState<'daily' | 'exercise'>('daily');
  const lastGpsPointRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const totalDistanceRef = useRef(0);
  const currentStepsRef = useRef(0);

  // Sync ref for interval
  useEffect(() => {
    currentStepsRef.current = gpsSteps;
  }, [gpsSteps]);

  // GPS step-rate calculation interval
  useEffect(() => {
    const history: { steps: number; timestamp: number }[] = [];
    
    const interval = setInterval(() => {
      const now = Date.now();
      const current = currentStepsRef.current;
      
      history.push({ steps: current, timestamp: now });
      
      const cutoff = now - 15000; // 15-second rolling window
      while (history.length > 0 && history[0].timestamp < cutoff) {
        history.shift();
      }
      
      if (history.length > 1) {
        const oldest = history[0];
        const newest = history[history.length - 1];
        const elapsedMs = newest.timestamp - oldest.timestamp;
        
        if (elapsedMs > 2000) {
          const stepDiff = newest.steps - oldest.steps;
          if (stepDiff < 0) {
             setGpsActivityStatus("REST");
             history.length = 0; // Clear history on step reset
          } else {
             const elapsedMinutes = elapsedMs / 60000;
             const stepsPerMinute = stepDiff / elapsedMinutes;
             
             if (stepsPerMinute >= 100) {
               setGpsActivityStatus("HIGH");
             } else if (stepsPerMinute >= 5) {
               setGpsActivityStatus("ACTIVE");
             } else {
               setGpsActivityStatus("REST");
             }
          }
        }
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Initialize notifications
  useHealthNotifications(hr, gpsSteps, hasWarning, warningMessage);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus({ state: "error", message: "Geolocation unavailable" });
      return;
    }

    const storedDistance = Number(window.localStorage.getItem("health-companion-total-distance"));
    if (Number.isFinite(storedDistance) && storedDistance > 0) {
      totalDistanceRef.current = storedDistance;
      setGpsDistance(storedDistance);
      setGpsSteps(Math.floor(storedDistance / 0.70));
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (position.coords.accuracy >= 45) return;

        const currentPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const previousPoint = lastGpsPointRef.current;
        const distanceDelta = previousPoint ? gpsDistanceBetween(previousPoint, currentPoint) : 0;
        const acceptedDelta = distanceDelta >= 1 ? distanceDelta : 0;
        lastGpsPointRef.current = currentPoint;

        totalDistanceRef.current += acceptedDelta;
        const totalDistanceMeters = totalDistanceRef.current;

        window.localStorage.setItem("health-companion-total-distance", String(totalDistanceMeters));
        setGpsDistance(totalDistanceMeters);
        setGpsSteps(Math.floor(totalDistanceMeters / 0.70));
        setGpsStatus({ state: "active", accuracy: position.coords.accuracy, distance: totalDistanceMeters });
      },
      (error) => setGpsStatus({ state: "error", message: error.message }),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const calculateRecoveryAndSleep = async () => {
      try {
        const records = await getDecryptedTelemetryRecords();
        const now = Date.now();
        const last24Hours = records.filter((record) => record.timestamp >= now - 24 * 60 * 60 * 1000);
        const parsedRecords = last24Hours
          .map((record) => {
            const values = record.payload.split(",");
            const hr = Number(values[0]);
            const motionLevel = Number(values[4] || 0);
            const hrv = Number.isFinite(hr) ? Math.round(70 - (hr - 70) * 0.4) : NaN;
            return { timestamp: record.timestamp, hr, motionLevel, hrv };
          })
          .filter((record) => Number.isFinite(record.hr) && record.hr > 0)
          .sort((first, second) => first.timestamp - second.timestamp);

        if (parsedRecords.length === 0) return;

        const dailyAverageHr = parsedRecords.reduce((sum, record) => sum + record.hr, 0) / parsedRecords.length;
        const qualifyingRecords = parsedRecords.filter((record) =>
          record.hr <= dailyAverageHr * 0.9 &&
          record.hr >= dailyAverageHr * 0.85 &&
          record.motionLevel === 0,
        );

        let longestBlock: typeof qualifyingRecords = [];
        let currentBlock: typeof qualifyingRecords = [];
        qualifyingRecords.forEach((record, index) => {
          const previousRecord = qualifyingRecords[index - 1];
          if (!previousRecord || record.timestamp - previousRecord.timestamp <= 5 * 60 * 1000) {
            currentBlock.push(record);
          } else {
            if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;
            currentBlock = [record];
          }
        });
        if (currentBlock.length > longestBlock.length) longestBlock = currentBlock;

        if (longestBlock.length === 0) return;

        const firstSleepRecord = longestBlock[0];
        const lastSleepRecord = longestBlock[longestBlock.length - 1];
        const sleepDurationMs = Math.max(0, lastSleepRecord.timestamp - firstSleepRecord.timestamp);
        const sleepMinutes = Math.round(sleepDurationMs / 60000);
        const sleepHours = Math.floor(sleepMinutes / 60);
        const remainingMinutes = sleepMinutes % 60;
        const sleepHrv = longestBlock.reduce((sum, record) => sum + record.hrv, 0) / longestBlock.length;
        const historicalHrvRecords = records
          .map((record) => {
            const hr = Number(record.payload.split(",")[0]);
            return Number.isFinite(hr) && hr > 0 ? Math.round(70 - (hr - 70) * 0.4) : NaN;
          })
          .filter((hrv) => Number.isFinite(hrv) && hrv > 0);
        const historicalHrvBaseline = historicalHrvRecords.length
          ? historicalHrvRecords.reduce((sum, hrv) => sum + hrv, 0) / historicalHrvRecords.length
          : 0;

        if (isMounted) {
          setSleep(`${sleepHours}h ${remainingMinutes}m`);
          setRecovery(historicalHrvBaseline > 0
            ? Math.max(0, Math.min(100, Math.round((sleepHrv / historicalHrvBaseline) * 100)))
            : "--");
        }
      } catch {
        // IndexedDB may be unavailable until the browser grants storage access.
      }
    };

    void calculateRecoveryAndSleep();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const strainInterval = setInterval(() => {
      setStrain((currentStrain) => {
        const numericHr = Number(hr);
        const increment = numericHr > 100 ? 0.2 : 0.1;
        return Math.min(21.0, currentStrain + increment);
      });
    }, 5000);

    return () => clearInterval(strainInterval);
  }, [hr]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Section (Greeting & Health Score Ring) */}
      <HeaderSection
        userName={userName}
        fingerPresent={fingerPresent}
        hasWarning={hasWarning}
        warningMessage={warningMessage}
        mqttConnected={mqttConnected}
      />

      {/* Tabs */}
      <div className="flex p-1 space-x-2 bg-slate-900 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Routine
        </button>
        <button
          onClick={() => setActiveTab('exercise')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'exercise'
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Exercise
        </button>
      </div>

      {/* Environment Section */}
      <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg backdrop-blur-xl">
          <ThermometerSun className="w-6 h-6 text-amber-400 mb-2" />
          <span className="text-xl font-bold text-slate-100">{envTemp !== "--" ? `${envTemp}°` : "--"}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Amb Temp</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg backdrop-blur-xl">
          <Droplets className="w-6 h-6 text-blue-400 mb-2" />
          <span className="text-xl font-bold text-slate-100">{envHumidity !== "--" ? `${envHumidity}%` : "--"}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Humidity</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg backdrop-blur-xl">
          <Wind className="w-6 h-6 text-emerald-400 mb-2" />
          <span className="text-xl font-bold text-slate-100">{airQuality}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Air Qual</span>
        </div>
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-4 animate-fade-in">
          <SamsungGalaxyRings
            sleepText={sleep}
            stepsText={gpsSteps}
            hrText={hr === "--" ? "--" : `${hr} bpm`}
          />

          <WhoopMonitorPanel
            hr={hr}
            hrv={derivedHrv}
            spo2={spo2}
            temp={temp}
            steps={gpsSteps}
            fingerPresent={fingerPresent}
            respRate={respRate}
            stress={stress}
            strain={strain}
            recovery={recovery}
            sleep={sleep}
          />
        </div>
      )}

      {activeTab === 'exercise' && (
        <div className="relative animate-fade-in">
          <MetricsGrid
            hr={hr}
            spo2={spo2}
            temp={temp}
            fingerPresent={fingerPresent}
            steps={gpsSteps}
            activityStatus={gpsActivityStatus}
            gpsStatus={gpsStatus}
            onOpenMetricDetail={onOpenMetricDetail}
          />
        </div>
      )}

    </div>
  );
};
