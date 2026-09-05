"use client";

import React, { useEffect, useState } from "react";
import { X, Heart, Droplet, Thermometer, Footprints, ShieldCheck, Cpu } from "lucide-react";
import { getRecentTelemetry, RecentTelemetryMetric, RecentTelemetryPoint } from "@/utils/telemetryBuffer";

export interface MetricDetailData {
  type: "hr" | "spo2" | "temp" | "activity";
  label: string;
  value: string;
  subtext: string;
  status: "normal" | "warning" | "offline";
}

interface MetricDetailModalProps {
  data: MetricDetailData | null;
  onClose: () => void;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  data,
  onClose,
}) => {
  const [telemetryPoints, setTelemetryPoints] = useState<RecentTelemetryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const metricType: RecentTelemetryMetric = data?.type === "hr"
    ? "HR"
    : data?.type === "spo2"
    ? "SPO2"
    : data?.type === "temp"
    ? "TEMP"
    : "ACTIVITY";
  const isOpen = data !== null;

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    void getRecentTelemetry(metricType, 20).then((points) => {
      if (!isMounted) return;
      setTelemetryPoints(points);
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [metricType, isOpen]);

  if (!data) return null;

  const values = telemetryPoints.map((point) => point.value);
  const minimum = values.length ? Math.min(...values) : null;
  const maximum = values.length ? Math.max(...values) : null;
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const unit = data.type === "hr" ? "bpm" : data.type === "spo2" ? "%" : data.type === "temp" ? "°C" : "steps";
  const formatValue = (value: number) => `${data.type === "temp" ? value.toFixed(1) : Math.round(value)} ${unit}`;

  const getIcon = () => {
    switch (data.type) {
      case "hr":
        return <Heart className="w-6 h-6 text-cyan-400 animate-pulse" />;
      case "spo2":
        return <Droplet className="w-6 h-6 text-cyan-400" />;
      case "temp":
        return <Thermometer className="w-6 h-6 text-cyan-400" />;
      case "activity":
        return <Footprints className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative overflow-hidden">
        {/* Top Accent Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {data.label} Insights
            </h3>
            <p className="text-xs text-slate-400">
              SpaMA Motion-Corrected Telemetry Stream
            </p>
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Telemetry
            </span>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {data.value}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Optimal</span>
            </span>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              On-Device SpaMA AI
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">24h Minimum</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              {isLoading || minimum === null ? "..." : formatValue(minimum)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">24h Average</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">
              {isLoading || average === null ? "..." : formatValue(average)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">24h Maximum</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">
              {isLoading || maximum === null ? "..." : formatValue(maximum)}
            </div>
          </div>
        </div>

        <div className="max-h-32 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 divide-y divide-slate-800">
          {telemetryPoints.slice().reverse().map((point) => (
            <div key={point.timestamp} className="flex items-center justify-between px-3 py-2 text-[10px] font-mono">
              <span className="text-slate-500">{new Date(point.timestamp).toLocaleTimeString()}</span>
              <span className="font-bold text-cyan-300">{formatValue(point.value)}</span>
            </div>
          ))}
          {!isLoading && telemetryPoints.length === 0 && <div className="px-3 py-2 text-[10px] text-slate-500">No telemetry points available</div>}
        </div>

        {/* SpaMA Noise Filter Banner */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <div className="font-semibold text-cyan-300">SpaMA Spectral Filter</div>
              <div className="text-[10px] text-slate-400">Accelerometer-Assisted Noise Erasure</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
            0.04 RMS Noise
          </span>
        </div>

        {/* Waveform Graphic */}
        <div className="h-20 w-full bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center relative overflow-hidden">
          <svg className="w-full h-16" viewBox="0 0 300 60" preserveAspectRatio="none">
            <path
              d="M 0,30 Q 30,10 60,35 T 120,20 T 180,40 T 240,15 L 300,30"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_#22d3ee]"
            />
          </svg>
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
            Sampling: 100 Hz PPG
          </div>
        </div>

        {/* Close Action */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
        >
          Close Insights
        </button>
      </div>
    </div>
  );
};
