export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  knownConditions: string;
  isLoggedIn: boolean;
}

export interface HardwareConfig {
  connectionType: "dweet" | "cirkit_wifi" | "mqtt";
  dweetThingName: string;
  wifiIpAddress: string;
  mqttTopic: string;
  pollIntervalMs: number;
}

export interface VitalMetrics {
  hr: number | string;
  hrv: number | string;
  spo2: number | string;
  temp: number | string;
  fingerPresent: number;
  steps: number;
  distanceKm: number;
  calories: number;
  motionLevel?: number;
  accelX?: number;
  accelY?: number;
  accelZ?: number;
  timestamp?: string;
  dataSource?: string;
}

export interface GpsPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GpsTrackingState {
  path: GpsPoint[];
  totalDistanceMeters: number;
  steps: number;
}

export interface AIRiskPrediction {
  overallHealthScore: number; // 0 - 100
  riskCategory: "Optimal" | "Low Risk" | "Moderate Risk" | "High Alert" | "Offline / Waiting";
  cardioRiskPct: number; // 0 - 100%
  hypoxiaRiskPct: number; // 0 - 100%
  pyrexiaRiskPct: number; // 0 - 100%
  autonomicStressPct: number; // 0 - 100%
  bmi: number;
  maxRecommendedHr: number;
  spamaSignalNoiseRatioDb: number;
  diagnosticPredictions: string[];
  recommendedActions: string[];
}

export interface NotificationItem {
  id: string;
  type: "risk" | "cheer" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface HealthLogDay {
  date: string;
  dayIndex: 1 | 2 | 3;
  avgHr: number;
  avgSpo2: number;
  avgTemp: number;
  totalSteps: number;
  rawPpgCount: number;
  hoursRemaining: number;
}
