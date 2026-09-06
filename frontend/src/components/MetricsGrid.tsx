"use client";

import React from "react";
import { Heart, Droplet, Thermometer, Footprints } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { MetricDetailData } from "./MetricDetailModal";

interface MetricsGridProps {
  hr: string | number;
  spo2: string | number;
  temp: string | number;
  fingerPresent: number;
  steps: number;
  activityStatus?: string;
  gpsStatus?:
    | { state: "searching" }
    | { state: "active"; accuracy: number; distance: number }
    | { state: "error"; message: string };
  onOpenMetricDetail?: (data: MetricDetailData) => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  hr,
  spo2,
  temp,
  fingerPresent,
  steps,
  activityStatus,
  gpsStatus,
  onOpenMetricDetail,
}) => {
  const isDisconnected = fingerPresent === 0;

  // Format values according to fingerPresent state
  const hrDisplay = isDisconnected || hr === "--" ? "--" : `${hr} bpm`;
  const spo2Display = isDisconnected || spo2 === "--" ? "--" : `${spo2} %`;
  const tempDisplay = temp === "--" ? "-- °C" : `${temp} °C`;

  // Numeric parsing for alert threshold logic
  const numericHr = typeof hr === "number" ? hr : parseFloat(String(hr));
  const numericSpo2 = typeof spo2 === "number" ? spo2 : parseFloat(String(spo2));
  const numericTemp = typeof temp === "number" ? temp : parseFloat(String(temp));

  // Early Warning Thresholds: HR > 100 or HR < 50, SpO2 < 95, Temp > 38.0
  const isHrWarning = !isDisconnected && !isNaN(numericHr) && (numericHr > 100 || numericHr < 50);
  const isSpo2Warning = !isDisconnected && !isNaN(numericSpo2) && numericSpo2 < 95;
  const isTempWarning = !isDisconnected && !isNaN(numericTemp) && numericTemp > 38.0;

  const hrColor = isHrWarning ? "#f43f5e" : "#22d3ee";
  const spo2Color = isSpo2Warning ? "#f43f5e" : "#22d3ee";
  const tempColor = isTempWarning ? "#f43f5e" : "#22d3ee";
  const hrAnimationDuration = isDisconnected
    ? "0s"
    : numericHr > 100
    ? "0.6s"
    : numericHr < 70
    ? "1.65s"
    : `${Math.max(0.7, Math.min(1.5, 60 / Math.max(40, numericHr)))}s`;
  const pulseAnimationDuration = isDisconnected
    ? "0s"
    : `${Math.max(0.65, Math.min(1.5, 60 / Math.max(40, numericHr)))}s`;

  return (
    <section className="w-full grid grid-cols-2 gap-3.5 sm:gap-4 my-4">
      {/* Card 1: Heart Rate */}
      <MetricCard
        icon={Heart}
        label="Heart Rate"
        value={hrDisplay}
        isWarning={isHrWarning}
        onClick={() =>
          onOpenMetricDetail?.({
            type: "hr",
            label: "Heart Rate",
            value: hrDisplay,
            subtext: isHrWarning ? "CRITICAL: Tachycardia Threshold Exceeded (>100 BPM)" : "Continuous PPG Telemetry Stream",
            status: isHrWarning ? "warning" : "normal",
          })
        }
        bottomGraphic={
          <div className="h-10 w-full relative flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`hrGrad-${isHrWarning ? "warn" : "norm"}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={hrColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={hrColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,25 Q 15,10 30,22 T 60,12 T 85,20 T 100,5 L 100,30 L 0,30 Z"
                fill={`url(#hrGrad-${isHrWarning ? "warn" : "norm"})`}
              />
              <path
                d={isDisconnected ? "M 0,20 L 100,20" : "M 0,20 L 18,20 L 24,20 L 27,5 L 30,27 L 33,20 L 48,20 L 54,20 L 57,11 L 60,24 L 63,20 L 78,20 L 84,20 L 87,6 L 90,27 L 93,20 L 100,20"}
                fill="none"
                stroke={hrColor}
                strokeWidth="2.2"
                strokeLinecap="round"
                className={isDisconnected ? "opacity-40" : "metric-wave"}
                style={{
                  filter: `drop-shadow(0 0 6px ${hrColor})`,
                  animationDuration: hrAnimationDuration,
                }}
              />
              {!isDisconnected && <circle cx="87" cy="6" r="2.5" fill={hrColor} className="metric-pulse-dot" style={{ animationDuration: pulseAnimationDuration }} />}
            </svg>
          </div>
        }
      />

      {/* Card 2: SpO2 */}
      <MetricCard
        icon={Droplet}
        label="SpO2"
        value={spo2Display}
        isWarning={isSpo2Warning}
        onClick={() =>
          onOpenMetricDetail?.({
            type: "spo2",
            label: "Blood Oxygen (SpO2)",
            value: spo2Display,
            subtext: isSpo2Warning ? "CRITICAL: Hypoxia Alert (<95% SpO2)" : "Infrared Optical Pulse Sensor",
            status: isSpo2Warning ? "warning" : "normal",
          })
        }
        bottomGraphic={
          <div className="h-10 w-full flex items-end justify-between gap-1.5 px-1">
            {[40, 65, 50, 85, 95, 75, 98, 88].map((heightPct, idx) => (
              <div key={idx} className="flex-1 bg-slate-800 rounded-t-sm h-full flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${isDisconnected ? "" : "metric-bar"}`}
                  style={{
                    height: isDisconnected ? "20%" : `${heightPct}%`,
                    opacity: 0.7 + (idx % 3) * 0.15,
                    backgroundColor: spo2Color,
                    boxShadow: `0 0 6px ${spo2Color}`,
                    animationDelay: `${idx * 0.1}s`,
                    animationDuration: pulseAnimationDuration,
                  }}
                />
              </div>
            ))}
          </div>
        }
      />

      {/* Card 3: Skin Temperature */}
      <MetricCard
        icon={Thermometer}
        label="Skin Temperature"
        value={tempDisplay}
        isWarning={isTempWarning}
        onClick={() =>
          onOpenMetricDetail?.({
            type: "temp",
            label: "Skin Temperature",
            value: tempDisplay,
            subtext: isTempWarning ? "CRITICAL: Hyperthermia Alert (>38.0°C)" : "High Precision Thermistor",
            status: isTempWarning ? "warning" : "normal",
          })
        }
        bottomGraphic={
          <div className="h-10 w-full relative flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`tempGrad-${isTempWarning ? "warn" : "norm"}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tempColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={tempColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,15 C 20,5 30,25 50,15 C 70,5 80,25 100,15 L 100,30 L 0,30 Z"
                fill={`url(#tempGrad-${isTempWarning ? "warn" : "norm"})`}
              />
              <path
                d="M 0,15 C 20,5 30,25 50,15 C 70,5 80,25 100,15"
                fill="none"
                stroke={tempColor}
                strokeWidth="2.2"
                strokeLinecap="round"
                className="metric-temperature-wave"
                style={{ filter: `drop-shadow(0 0 8px ${tempColor})` }}
              />
            </svg>
          </div>
        }
      />

      {/* Card 4: Activity (Dynamic Live Steps) */}
      <MetricCard
        icon={Footprints}
        label="Activity"
        value={steps > 0 ? `${steps.toLocaleString()} Steps` : "--"}
        onClick={() =>
          onOpenMetricDetail?.({
            type: "activity",
            label: "Daily Activity",
            value: `${steps.toLocaleString()} Steps`,
            subtext: "On-Device Accelerometer Step Tracking",
            status: "normal",
          })
        }
        bottomGraphic={
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <span>Target: 10,000</span>
              <span className="text-cyan-400 font-semibold">{Math.min(100, Math.floor((steps / 10000) * 100))}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-700 relative shadow-[0_0_10px_#22d3ee] activity-shimmer"
                style={{ width: `${Math.min(100, Math.floor((steps / 10000) * 100))}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-medium pt-1">
              <span className="text-slate-400">Current Status:</span>
              <span className={`font-semibold ${
                activityStatus === "HIGH" ? "text-rose-400" :
                activityStatus === "ACTIVE" ? "text-cyan-400" :
                activityStatus === "LIGHT" ? "text-amber-400" :
                "text-slate-300"
              }`}>
                {activityStatus || "UNKNOWN"} {activityStatus === "RESTING" && "(Sleep/Rest)"}
              </span>
            </div>

            {gpsStatus?.state === "searching" && <span className="text-[10px] text-amber-500">GPS: Searching (Waiting for fix)</span>}
            {gpsStatus?.state === "active" && (
              <span className="text-[10px] text-cyan-500">GPS: Active (Acc: ±{gpsStatus.accuracy.toFixed(1)}m | Dist: {gpsStatus.distance.toFixed(1)}m)</span>
            )}
            {gpsStatus?.state === "error" && <span className="text-[10px] text-red-500">GPS Error: {gpsStatus.message}</span>}
          </div>
        }
      />
    </section>
  );
};
