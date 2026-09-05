"use client";

import React from "react";
import { Shield, Heart, AlertTriangle, Radio } from "lucide-react";

interface HeaderSectionProps {
  userName: string;
  fingerPresent: number;
  hasWarning: boolean;
  warningMessage?: string | null;
  mqttConnected: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  userName,
  fingerPresent,
  hasWarning,
  warningMessage,
  mqttConnected,
}) => {
  const isDisconnected = fingerPresent === 0;

  // Derived Health Score & Color Schemes
  const healthScore = isDisconnected ? "--" : hasWarning ? 65 : 98;
  const healthStatusText = isDisconnected
    ? "Offline"
    : hasWarning
    ? "Critical Risk"
    : "Excellent";

  const ringStrokeColor = isDisconnected
    ? "#64748b"
    : hasWarning
    ? "#f43f5e"
    : "#22d3ee";

  const gradientStart = isDisconnected
    ? "#64748b"
    : hasWarning
    ? "#f43f5e"
    : "#22d3ee";

  const gradientEnd = isDisconnected
    ? "#475569"
    : hasWarning
    ? "#e11d48"
    : "#06b6d4";

  return (
    <section className={`w-full border rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md transition-colors duration-500 ${
      hasWarning 
        ? "bg-slate-950/90 border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.2)]" 
        : "bg-slate-900/60 border-slate-800/80 shadow-[0_0_25px_rgba(34,211,238,0.06)]"
    }`}>
      {/* Decorative Radial Glow Background */}
      <div className={`absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
        hasWarning ? "bg-rose-500/20" : "bg-cyan-500/10"
      }`} />
      <div className={`absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
        hasWarning ? "bg-rose-500/20" : "bg-cyan-500/10"
      }`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center relative z-10">
        {/* Left Column */}
        <div className="flex flex-col items-start space-y-2.5">
          <div className="space-y-0.5">
            <span className="text-slate-300 text-sm font-medium tracking-wide">
              Hello,
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              {userName || "User"}
            </h2>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm font-normal">
            Your health. Always protected.
          </p>

          {/* Badge Pill */}
          <div className="pt-1">
            {isDisconnected ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Sensor Disconnected</span>
              </div>
            ) : hasWarning ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 text-xs font-extrabold tracking-wide shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>CRITICAL: Abnormal Vitals Detected</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>All Systems Normal</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Glowing Dynamic Health Score Progress Ring */}
        <div className="flex justify-center sm:justify-end items-center">
          <div className="relative w-36 h-36 md:w-40 md:h-40 flex items-center justify-center">
            {/* Background glowing aura */}
            <div className={`absolute inset-0 rounded-full blur-md animate-pulse ${
              hasWarning ? "bg-rose-500/20" : "bg-cyan-500/10"
            }`} />

            {/* SVG Circular Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Track Ring */}
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Glowing Dynamic Indicator Ring */}
              <circle
                cx="60"
                cy="60"
                r="50"
                strokeWidth="8"
                strokeDasharray={314}
                strokeDashoffset={314 * (1 - (isDisconnected ? 0 : hasWarning ? 0.65 : 0.98))}
                strokeLinecap="round"
                stroke={`url(#score-gradient-${hasWarning ? "warning" : "normal"})`}
                fill="transparent"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 10px ${ringStrokeColor})`,
                }}
              />
              <defs>
                <linearGradient id="score-gradient-normal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="score-gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inside Content */}
            <div className="absolute flex flex-col items-center justify-center text-center space-y-0.5">
              <Heart className={`w-4 h-4 animate-pulse ${
                hasWarning ? "text-rose-500 fill-rose-500/30" : "text-cyan-400 fill-cyan-400/20"
              }`} />
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Health Score
              </span>
              <span className={`text-4xl font-extrabold tracking-tight transition-colors duration-500 ${
                hasWarning ? "text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              }`}>
                {healthScore}
              </span>
              <span className={`text-xs font-bold tracking-wide ${
                hasWarning ? "text-rose-400" : "text-cyan-400"
              }`}>
                {healthStatusText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
