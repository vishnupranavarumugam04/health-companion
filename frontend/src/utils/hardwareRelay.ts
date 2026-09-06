import { VitalMetrics, HardwareConfig } from "@/types/health";

export const defaultHardwareConfig: HardwareConfig = {
  connectionType: "dweet",
  dweetThingName: "kpsplayz_ring_sih26181",
  wifiIpAddress: "/api/telemetry",
  mqttTopic: "kps_playz/sih/healthdata",
  pollIntervalMs: 1000,
};

const CONFIG_KEY = "sih_hardware_config";

interface TelemetryPayload {
  hr?: string | number;
  heartRate?: string | number;
  spo2?: string | number;
  temp?: string | number;
  temperature?: string | number;
  finger?: string | number;
  steps?: string | number;
  motionLevel?: string | number;
  x?: string | number;
  y?: string | number;
  z?: string | number;
  connected?: boolean;
  isHardwareOnline?: boolean;
  source?: string;
  activity?: string;
  fall?: boolean;
  environmentalTemperature?: string | number;
  humidity?: string | number;
  airQuality?: string | number;
}

export const getStoredHardwareConfig = (): HardwareConfig => {
  if (typeof window === "undefined") return defaultHardwareConfig;
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : defaultHardwareConfig;
  } catch (e) {
    return defaultHardwareConfig;
  }
};

export const saveStoredHardwareConfig = (config: HardwareConfig): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save hardware config", e);
  }
};

/**
 * Polls local Next.js /api/telemetry endpoint which bridges Cirkit hardware telemetry dynamically
 */
export async function fetchLiveHardwareData(config: HardwareConfig): Promise<VitalMetrics | null> {
  try {
    const res = await fetch("/api/telemetry", { 
      method: "GET", 
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data) {
        const payload = data as TelemetryPayload;
        return parseHardwarePayload(payload, payload.source || "Cirkit ESP32 Live");
      }
    }
  } catch (e) {
    // Silent catch
  }

  return null;
}

/**
 * Parses JSON payload from Cirkit hardware dynamically
 */
export function parseHardwarePayload(data: TelemetryPayload | string, sourceLabel: string): VitalMetrics | null {
  if (!data) return null;

  let payload: TelemetryPayload;
  if (typeof data === "string") {
    const parts = data.split(",");
    if (parts.length >= 3) {
      payload = {
        hr: parts[0],
        spo2: parts[1],
        temp: parts[2],
        finger: parts[3] || "1",
        connected: true,
      };
    } else {
      return null;
    }
  } else {
    payload = data;
  }

  const isOnline = payload.connected !== false && payload.isHardwareOnline !== false;
  const fingerPresent = isOnline ? (payload.finger !== undefined ? parseInt(String(payload.finger), 10) : 1) : 0;

  const parsedHr = isOnline && payload.hr !== undefined ? parseFloat(String(payload.hr)) : (isOnline && payload.heartRate !== undefined ? parseFloat(String(payload.heartRate)) : NaN);
  const parsedSpo2 = isOnline && payload.spo2 !== undefined ? parseFloat(String(payload.spo2)) : NaN;
  const parsedTemp = isOnline && payload.temp !== undefined ? parseFloat(String(payload.temp)) : (isOnline && payload.temperature !== undefined ? parseFloat(String(payload.temperature)) : NaN);

  const hr = !isNaN(parsedHr) && parsedHr > 0 ? parsedHr : "--";
  const spo2 = !isNaN(parsedSpo2) && parsedSpo2 > 0 ? parsedSpo2 : "--";
  const temp = !isNaN(parsedTemp) && parsedTemp > 0 ? parsedTemp : "--";
  const hrv = typeof hr === "number" ? Math.round(70 - (hr - 70) * 0.4) : "--";

  const steps = payload.steps !== undefined && !isNaN(parseInt(String(payload.steps), 10)) ? parseInt(String(payload.steps), 10) : 0;
  const distanceKm = Number((steps * 0.0007).toFixed(2));
  const calories = Math.round(steps * 0.04);

  return {
    hr,
    hrv,
    spo2,
    temp,
    fingerPresent,
    steps,
    distanceKm,
    calories,
    motionLevel: payload.motionLevel !== undefined ? parseFloat(String(payload.motionLevel)) : 0,
    accelX: payload.x !== undefined ? parseFloat(String(payload.x)) : 0,
    accelY: payload.y !== undefined ? parseFloat(String(payload.y)) : 0,
    accelZ: payload.z !== undefined ? parseFloat(String(payload.z)) : 0,
    activity: payload.activity || "RESTING",
    fall: payload.fall === true,
    environmentalTemperature: payload.environmentalTemperature !== undefined ? parseFloat(String(payload.environmentalTemperature)) : undefined,
    humidity: payload.humidity !== undefined ? parseFloat(String(payload.humidity)) : undefined,
    airQuality: payload.airQuality !== undefined ? parseFloat(String(payload.airQuality)) : undefined,
    timestamp: new Date().toLocaleTimeString(),
    dataSource: isOnline ? sourceLabel : "Not Connected",
  };
}
