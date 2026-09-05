"use client";

import React from "react";
import { Activity, User, Radio, Sparkles, Battery } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  mqttConnected: boolean;
  onOpenTelemetryModal: () => void;
  onShowConnectionStatus: () => void;
  onOpenProfile: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mqttConnected,
  onOpenTelemetryModal,
  onShowConnectionStatus,
  onOpenProfile,
  theme,
  onToggleTheme,
}) => {
  return (
    <nav className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-4 py-3 shadow-[0_4px_20px_rgba(2,6,23,0.8)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left: Activity Icon */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
        </div>

        {/* Center: Brand Name */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenTelemetryModal}>
          <h1 className="text-white font-semibold text-base md:text-lg tracking-tight flex items-center gap-1.5">
            <span>Health Companion</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </h1>
        </div>

        {/* Right: User Icon with Glowing Notification Dot */}
        <div className="flex items-center gap-2">
          {/* MQTT status quick indicator */}
          <button
            onClick={onShowConnectionStatus}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              mqttConnected
                ? "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30"
                : "bg-amber-950/60 text-amber-400 border border-amber-500/30"
            }`}
            title="Show connection status"
          >
            <Radio className={`w-3.5 h-3.5 ${mqttConnected ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">{mqttConnected ? "LIVE" : "SYNC"}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400" title="Battery status">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>84%</span>
          </div>

          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <button
            onClick={onOpenProfile}
            aria-label="Open profile"
            className="relative cursor-pointer flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-500/40 transition-colors"
          >
            <User className="w-5 h-5 text-slate-300" />
            {/* Glowing cyan notification dot */}
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] border-2 border-slate-900" />
          </button>
        </div>
      </div>
    </nav>
  );
};
