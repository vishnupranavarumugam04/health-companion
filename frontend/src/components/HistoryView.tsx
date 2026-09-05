"use client";

import React, { useEffect, useState } from "react";
import { Clock, ShieldCheck, Trash2, Database, Filter, Lock } from "lucide-react";
import { getRecentTelemetry, RecentTelemetryMetric, RecentTelemetryPoint } from "@/utils/telemetryBuffer";

interface HistoryViewProps {
  storageCountdown: string;
  rawStorageBytes: number;
  distilledStorageBytes: number;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ storageCountdown, rawStorageBytes, distilledStorageBytes }) => {
  type HistoryTab = "HR" | "SPO2" | "TEMP";
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTab>("HR");
  const [telemetryPoints, setTelemetryPoints] = useState<RecentTelemetryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const metricType = activeHistoryTab as RecentTelemetryMetric;

  useEffect(() => {
    let isMounted = true;
    void getRecentTelemetry(metricType, 30).then((points) => {
      if (!isMounted) return;
      setTelemetryPoints(points);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, [metricType]);

  const unit = activeHistoryTab === "HR" ? "bpm" : activeHistoryTab === "SPO2" ? "%" : "°C";
  const values = telemetryPoints.map((point) => point.value);
  const minimum = values.length ? Math.min(...values) : 0;
  const maximum = values.length ? Math.max(...values) : 1;
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const range = maximum - minimum || 1;
  const chartPoints = telemetryPoints.map((point, index) => ({
    x: (index / Math.max(1, telemetryPoints.length - 1)) * 300,
    y: 88 - ((point.value - minimum) / range) * 76,
  }));
  const chartPath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const chartAreaPath = `${chartPath} L 300,100 L 0,100 Z`;
  const activePoint = chartPoints[Math.floor(chartPoints.length * 0.65)] || { x: 0, y: 88 };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"><Clock className="w-5 h-5" /></div><div><h2 className="text-base font-bold text-white tracking-tight">Vital History &amp; Analytics</h2><p className="text-xs text-slate-400">SpaMA Filtered Signals &amp; Local Tiered Storage</p></div></div>
          <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.12)]">72H Local Buffer</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(34,211,238,0.06)]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {[{ id: "HR" as const, label: "Heart Rate" }, { id: "SPO2" as const, label: "SpO2" }, { id: "TEMP" as const, label: "Skin Temp" }].map((metric) => <button key={metric.id} onClick={() => setActiveHistoryTab(metric.id)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeHistoryTab === metric.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.15)]" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"}`}>{metric.label}</button>)}
          </div>
          <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">Avg: {isLoading ? "..." : `${average.toFixed(activeHistoryTab === "TEMP" ? 1 : 0)} ${unit}`}</span>
        </div>
        <div className="h-44 w-full relative flex items-end">
          <svg key={activeHistoryTab} className="w-full h-36 overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs><linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" /></linearGradient></defs>
            <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(51, 65, 85, 0.4)" strokeDasharray="4,4" /><line x1="0" y1="50" x2="300" y2="50" stroke="rgba(51, 65, 85, 0.4)" strokeDasharray="4,4" /><line x1="0" y1="80" x2="300" y2="80" stroke="rgba(51, 65, 85, 0.4)" strokeDasharray="4,4" />
            <path d={chartAreaPath} fill="url(#trendGradient)" className="history-chart-area" /><path d={chartPath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" pathLength="1" className="history-chart-line drop-shadow-[0_0_10px_#22d3ee]" />
            <circle cx={activePoint.x} cy={activePoint.y} r="4" fill="#ffffff" className="drop-shadow-[0_0_8px_#22d3ee]" /><circle cx="300" cy={chartPoints[chartPoints.length - 1]?.y ?? 88} r="4" fill="#22d3ee" className="animate-ping" />
          </svg>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800"><span>−72h</span><span>−60h</span><span>−48h</span><span>−36h</span><span>−24h</span><span>−12h</span><span>Now</span></div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Filter className="w-4 h-4 text-cyan-400" /><h3 className="text-sm font-bold text-white tracking-tight">SpaMA Motion Artifact Erasure</h3></div><span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">99.4% Noise Erased</span></div>
        <p className="text-xs text-slate-400">Accelerometer-assisted spectral filtering eliminates PPG motion corruption during workouts and motion.</p>
        <div className="grid grid-cols-2 gap-3 pt-1"><div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30"><div className="text-[10px] font-bold text-rose-400 uppercase">Raw Ring Signal (Unfiltered)</div><div className="h-10 mt-1 flex items-center justify-center overflow-hidden"><svg className="w-full h-8" viewBox="0 0 100 20"><path d="M 0,10 L 5,3 L 10,17 L 15,6 L 20,15 L 25,1 L 30,19 L 35,7 L 40,14 L 45,2 L 50,18 L 55,5 L 60,16 L 65,3 L 70,19 L 75,8 L 80,13 L 85,1 L 90,18 L 95,5 L 100,10" fill="none" stroke="#f43f5e" strokeWidth="1.5" pathLength="1" className="spama-raw-wave" /></svg></div><span className="text-[9px] font-mono text-slate-500">Heavy Motion Artifacts</span></div><div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30"><div className="text-[10px] font-bold text-cyan-400 uppercase">SpaMA Cleaned Waveform</div><div className="h-10 mt-1 flex items-center justify-center overflow-hidden"><svg className="w-full h-8" viewBox="0 0 100 20"><path d="M 0,10 C 8,4 16,4 24,10 S 40,16 48,10 S 64,4 72,10 S 88,16 100,10" fill="none" stroke="#22d3ee" strokeWidth="2" pathLength="1" className="spama-clean-wave drop-shadow-[0_0_6px_#22d3ee]" /></svg></div><span className="text-[9px] font-mono text-cyan-300">Clean Physiological Pulse</span></div></div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Database className="w-4 h-4 text-cyan-400" /><h3 className="text-sm font-bold text-white tracking-tight">Tiered Local Storage &amp; 72h Purge</h3></div><span className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30"><Lock className="w-3 h-3" /><span>Zero-Cloud Privacy</span></span></div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400"><Lock className="w-3 h-3" /><span>AES-256 Encrypted Local Edge Storage</span></div>
        <div className="space-y-2"><div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"><div className="flex items-center gap-2.5"><Trash2 className="w-4 h-4 text-amber-400 animate-pulse" /><div><div className="text-xs font-semibold text-white">Raw PPG Waveform Buffer</div><div className="text-[10px] text-slate-400">High frequency MB buffer — Purges in 72h</div></div></div><div className="text-right font-mono"><div className="text-xs font-bold text-amber-400">{storageCountdown}</div><div className="text-[9px] text-slate-500">{(rawStorageBytes / (1024 * 1024)).toFixed(2)} MB Local</div></div></div><div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"><div className="flex items-center gap-2.5"><ShieldCheck className="w-4 h-4 text-cyan-400" /><div><div className="text-xs font-semibold text-white">Distilled Daily Metrics Tier</div><div className="text-[10px] text-slate-400">Encrypted local KB summaries</div></div></div><div className="text-right font-mono"><div className="text-xs font-bold text-cyan-400">Permanent (Encrypted)</div><div className="text-[9px] text-slate-500">{(distilledStorageBytes / 1024).toFixed(1)} KB Total</div></div></div></div>
      </div>
    </div>
  );
};