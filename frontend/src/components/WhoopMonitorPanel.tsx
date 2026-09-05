"use client";

import React from "react";
import {
  Activity,
  Brain,
  Flame,
  Moon,
  ShieldCheck,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";

interface WhoopMonitorPanelProps {
  hr: string | number;
  hrv: string | number;
  spo2: string | number;
  temp: string | number;
  steps: number;
  fingerPresent: number;
  respRate: number | string;
  stress: string;
  strain: number;
  recovery: number | string;
  sleep: string;
}

interface MonitorItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  accent?: string;
}

const MonitorItem: React.FC<MonitorItemProps> = ({ icon: Icon, label, value, detail, accent = "text-cyan-400" }) => (
  <div className="flex items-center gap-3 border-b border-slate-800/70 py-3 last:border-b-0">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 border border-slate-800">
      <Icon className={`h-4 w-4 ${accent}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-white">{label}</p>
      <p className="mt-0.5 truncate text-[10px] text-slate-500">{detail}</p>
    </div>
    <span className={`text-sm font-bold ${value === "--" ? "text-slate-500" : accent}`}>{value}</span>
  </div>
);

export const WhoopMonitorPanel: React.FC<WhoopMonitorPanelProps> = ({
  hr,
  hrv,
  spo2,
  temp,
  steps,
  fingerPresent,
  respRate,
  stress,
  strain,
  recovery,
  sleep,
}) => {
  const isConnected = fingerPresent === 1;
  const liveValue = (value: string | number, suffix = "") =>
    isConnected && value !== "--" ? `${value}${suffix}` : "--";

  return (
    <section className="space-y-3" aria-label="Whoop-style health monitoring">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">Daily monitor</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Your day at a glance</h2>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
          <Activity className="h-3 w-3 text-cyan-400" />
          {isConnected ? "Live" : "Waiting"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Recovery</p>
          <p className="mt-2 text-2xl font-bold text-white">{recovery === "--" ? "--" : `${recovery}%`}</p>
          <p className="mt-1 text-[10px] text-slate-500">Daily recovery baseline</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Strain</p>
          <p className="mt-2 text-2xl font-bold text-white">{strain.toFixed(1)}</p>
          <p className="mt-1 text-[10px] text-slate-500">Daily strain load</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Sleep</p>
          <p className="mt-2 text-2xl font-bold text-white">{sleep}</p>
          <p className="mt-1 text-[10px] text-slate-500">Sleep duration</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Health monitor</h3>
          </div>
          <span className="text-[10px] font-medium text-slate-500">Continuous sensing</span>
        </div>
        <MonitorItem icon={Activity} label="Heart rate" value={liveValue(hr, " bpm")} detail="Real-time optical pulse" />
        <MonitorItem icon={Zap} label="Heart rate variability" value={liveValue(hrv, " ms")} detail="Recovery readiness signal" accent="text-emerald-400" />
        <MonitorItem icon={Wind} label="Blood oxygen" value={liveValue(spo2, "%")} detail="Pulse oximetry" accent="text-sky-400" />
        <MonitorItem icon={Sparkles} label="Skin temperature" value={liveValue(temp, " C")} detail="Temperature trend" accent="text-amber-400" />
        <MonitorItem icon={Wind} label="Respiratory rate" value={respRate === "--" ? "--" : `${respRate} bpm`} detail="Derived from live heart rate" accent="text-violet-300" />
        <MonitorItem icon={Brain} label="Stress monitor" value={stress} detail="Derived from live heart rate" accent="text-rose-300" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Moon className="h-4 w-4 text-indigo-300" />
            <span className="text-xs font-semibold">Sleep coach</span>
          </div>
          <p className="mt-4 text-lg font-bold text-white">No sleep cycle</p>
          <p className="mt-1 text-[10px] text-slate-500">Duration, stages and sleep debt appear here</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Flame className="h-4 w-4 text-orange-300" />
            <span className="text-xs font-semibold">Activity load</span>
          </div>
          <p className="mt-4 text-lg font-bold text-white">{steps.toLocaleString()} steps walked today</p>
          <p className="mt-1 text-[10px] text-slate-500">{Math.floor(steps * 0.04)} kcal estimated today</p>
        </div>
      </div>
    </section>
  );
};
