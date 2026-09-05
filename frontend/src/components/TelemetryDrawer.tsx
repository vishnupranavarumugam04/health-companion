"use client";

import React, { useState } from "react";
import { Radio, X, Send, Cpu, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mqttStatus: "connected" | "connecting" | "error" | "reconnecting";
  lastPayload: string;
  topic: string;
  brokerUrl: string;
  onPublishTestPayload: (payload: string) => void;
  onReconnect: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  mqttStatus,
  lastPayload,
  topic,
  brokerUrl,
  onPublishTestPayload,
  onReconnect,
}) => {
  const [customPayload, setCustomPayload] = useState<string>("75,97,36.7,1");

  if (!isOpen) return null;

  const presets = [
    { label: "Normal Vitals", payload: "72,98,36.6,1", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
    { label: "Finger Disconnected", payload: "0,0,36.5,0", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    { label: "Low SpO2 Alert (<92%)", payload: "80,88,36.8,1", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
    { label: "High HR Alert (>120)", payload: "135,97,37.1,1", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
    { label: "High Temp Alert (>38°C)", payload: "94,96,39.2,1", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                MQTT Telemetry & IoT Console
              </h3>
              <p className="text-xs text-slate-400">
                Live MQTT WebSocket payload inspector & scenario tester
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status info */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Connection</span>
            <div className="flex items-center gap-1.5 mt-1">
              {mqttStatus === "connected" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400">CONNECTED</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-amber-400 uppercase">{mqttStatus}</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Topic</span>
            <div className="text-xs font-mono font-bold text-slate-200 truncate mt-1">
              {topic}
            </div>
          </div>
        </div>

        {/* Broker & Last Payload */}
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Broker WebSocket:</span>
            <span className="font-mono text-cyan-300 font-semibold">{brokerUrl}</span>
            <button
              onClick={onReconnect}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Reconnect MQTT"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
              <span>Last Received Payload (HR,SpO2,Temp,Finger)</span>
              <span className="text-cyan-400">Live String</span>
            </div>
            <div className="p-2 rounded bg-slate-900 font-mono text-cyan-300 text-sm font-bold border border-slate-800 tracking-wider">
              {lastPayload || "No payload received yet"}
            </div>
          </div>
        </div>

        {/* Simulation presets */}
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Test Scenario Telemetry Presets:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => onPublishTestPayload(preset.payload)}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${preset.color}`}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="font-mono text-[10px] opacity-80 mt-0.5">
                  Payload: {preset.payload}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom string input */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Send Custom Telemetry String:
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              placeholder="e.g. 72,98,36.6,1"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => onPublishTestPayload(customPayload)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_#22d3ee]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
