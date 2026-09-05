"use client";

import React from "react";
import { UserProfile, VitalMetrics } from "@/types/health";
import { analyzeHealthRisk } from "@/utils/mlEngine";
import { 
  Heart, Droplet, Thermometer, Footprints, Activity, ShieldCheck, 
  MapPin, Satellite, Navigation, Cpu, Sparkles, ChevronRight, Zap, Radio
} from "lucide-react";

interface DashboardPageProps {
  user: UserProfile;
  vitals: VitalMetrics;
  onOpenMetricDetail: (type: "hr" | "hrv" | "spo2" | "temp" | "activity") => void;
  onOpenTelemetryConsole: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  vitals,
  onOpenMetricDetail,
  onOpenTelemetryConsole,
}) => {
  const isDisconnected = vitals.fingerPresent === 0 || vitals.hr === "--";

  // Real-time ML Model Risk Prediction based on User Profile + Live Hardware Telemetry
  const aiPrediction = analyzeHealthRisk(user, vitals);

  // Automatic Activity Detection from Hardware Motion & Step Telemetry
  const isMoving = vitals.steps > 0 || (vitals.accelX !== undefined && Math.abs(vitals.accelX) > 0.05);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* 1. Header & User Greeting Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Welcome back,
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {user.name || "User"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              <span>{user.age} Yrs</span>
              <span>•</span>
              <span>{user.heightCm} cm / {user.weightKg} kg (BMI {aiPrediction.bmi})</span>
              <span>•</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">{user.bloodGroup}</span>
            </div>
          </div>

          {/* Health Score Badge Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              {aiPrediction.overallHealthScore > 0 && (
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  strokeWidth="6"
                  strokeDasharray={213}
                  strokeDashoffset={213 * (1 - aiPrediction.overallHealthScore / 100)}
                  strokeLinecap="round"
                  stroke={
                    aiPrediction.overallHealthScore > 80
                      ? "#0d9488"
                      : aiPrediction.overallHealthScore > 60
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                  fill="transparent"
                  className="transition-all duration-1000"
                />
              )}
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none block">
                {aiPrediction.overallHealthScore > 0 ? aiPrediction.overallHealthScore : "--"}
              </span>
              <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Ring Fusion Status Pill */}
      <div 
        onClick={onOpenTelemetryConsole}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between cursor-pointer hover:border-teal-500 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Smart Ring Telemetry Stream
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-mono text-[9px] font-bold">
                {vitals.dataSource || "Cirkit WiFi"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {isDisconnected
                ? "Sensor Off / Place finger on optical sensor"
                : `Active Continuous Sensor • SNR: +${aiPrediction.spamaSignalNoiseRatioDb} dB`}
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 3. Vitals Grid (Heart Rate, HRV, SpO2, Skin Temp) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Heart Rate */}
        <div
          onClick={() => onOpenMetricDetail("hr")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-teal-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Heart Rate</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {isDisconnected ? "--" : `${vitals.hr} bpm`}
          </div>
          <div className="h-8 mt-2 w-full flex items-end">
            <svg className="w-full h-6" viewBox="0 0 100 24">
              <path
                d="M 0,18 Q 15,6 30,15 T 60,8 T 85,14 T 100,4"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: SpO2 */}
        <div
          onClick={() => onOpenMetricDetail("spo2")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-teal-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Droplet className="w-4 h-4 text-cyan-500" />
              <span>Blood Oxygen (SpO2)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {isDisconnected ? "--" : `${vitals.spo2} %`}
          </div>
          <div className="h-8 mt-2 w-full flex items-end justify-between gap-1 px-1">
            {[60, 80, 70, 90, 100, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-teal-100 dark:bg-slate-800 h-full flex items-end rounded-t-sm">
                <div
                  className="w-full bg-cyan-500 rounded-t-sm"
                  style={{ height: isDisconnected ? `10%` : `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: HRV */}
        <div
          onClick={() => onOpenMetricDetail("hrv")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-teal-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>HRV (Autonomic)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {isDisconnected ? "--" : `${vitals.hrv} ms`}
          </div>
          <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-2">
            Stress Index: {aiPrediction.autonomicStressPct}%
          </div>
        </div>

        {/* Card 4: Skin Temp */}
        <div
          onClick={() => onOpenMetricDetail("temp")}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-teal-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <span>Skin Temperature</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {isDisconnected ? "--" : `${vitals.temp} °C`}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
            Pyrexia Risk: {aiPrediction.pyrexiaRiskPct}%
          </div>
        </div>
      </div>

      {/* 4. AI-Driven ML Risk Factor Analysis (SIH Statement 26181) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Trained ML Risk Prediction Engine
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Evaluating Profile ({user.gender || "User"}, Age {user.age || 0}, BMI {aiPrediction.bmi}) + Hardware Vitals
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
              aiPrediction.riskCategory === "Optimal"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-700 dark:text-emerald-400"
                : aiPrediction.riskCategory === "Low Risk"
                ? "bg-teal-50 dark:bg-teal-950/60 border-teal-200 text-teal-700 dark:text-teal-400"
                : aiPrediction.riskCategory === "Moderate Risk"
                ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 text-amber-700 dark:text-amber-400"
                : aiPrediction.riskCategory === "High Alert"
                ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 text-rose-700 dark:text-rose-400 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-500"
            }`}
          >
            {aiPrediction.riskCategory.toUpperCase()}
          </span>
        </div>

        {/* Risk Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Cardio Risk</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{aiPrediction.cardioRiskPct}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Hypoxia Risk</span>
            <span className="font-bold text-teal-600 dark:text-teal-400 mt-0.5 block">{aiPrediction.hypoxiaRiskPct}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">SpaMA SNR</span>
            <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">+{aiPrediction.spamaSignalNoiseRatioDb} dB</span>
          </div>
        </div>

        {/* AI Insight Bullets */}
        <div className="space-y-2 pt-1">
          {aiPrediction.diagnosticPredictions.map((pred, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{pred}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Mobile-Centric GPS Outdoor Activity & Automatic Motion Detector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Mobile GPS &amp; Automatic Motion Tracker
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Hardware Motion Accelerometer &amp; Step Sensor Offload
              </p>
            </div>
          </div>

          {/* Automatic Motion Detection Badge */}
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 ${
              isMoving
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 animate-pulse"
                : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-teal-500" />
            <span>{isMoving ? "Auto: Walking Active" : "Auto: Resting Baseline"}</span>
          </span>
        </div>

        {/* Exercise Stats Bar */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Steps</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {vitals.steps.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Distance</span>
            <div className="text-lg font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
              {vitals.distanceKm} km
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Calories</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {vitals.calories} kcal
            </div>
          </div>
        </div>

        {/* GPS Route Map Container */}
        <div className="relative w-full h-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-map-pattern opacity-60" />

          {/* GPS Path Vector SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 350 160" preserveAspectRatio="none">
            <path
              d="M 30,130 Q 100,100 160,80 T 260,60 T 310,90"
              fill="none"
              stroke="#0d9488"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="30" cy="130" r="4" fill="#0d9488" />
            <circle cx="160" cy="80" r="4" fill="#0d9488" />
          </svg>

          {/* Current GPS Pin */}
          <div className="absolute top-[37%] left-[73%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 animate-ping absolute" />
              <div className="w-8 h-8 rounded-full bg-teal-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-md">
                <Navigation className="w-4 h-4 transform rotate-45" />
              </div>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[9px] font-mono font-semibold">
              Live GPS Pin
            </span>
          </div>

          {/* Corner GPS Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            <Satellite className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
            <span>GPS Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
