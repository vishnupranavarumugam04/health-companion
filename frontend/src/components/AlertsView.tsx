"use client";

import React, { useState } from "react";
import { Bell, AlertTriangle, PhoneCall, Plus, Save, MessageSquare } from "lucide-react";
import { EarlyWarningItem } from "./EarlyWarningModal";

interface AlertsViewProps {
  activeWarnings: EarlyWarningItem[];
  sosDispatched: boolean;
  emergencyPhone: string;
  currentLocation: string;
  onSaveEmergencyPhone: (phone: string) => void;
  riskInsights?: {
    baselineAnomaly: boolean;
    baselineHr: number | null;
    dehydrationRisk: "Low Risk" | "High Risk";
    fatigueRisk: "Low Risk" | "High Risk";
  };
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  activeWarnings,
  sosDispatched,
  emergencyPhone,
  currentLocation,
  onSaveEmergencyPhone,
  riskInsights,
}) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState(emergencyPhone);
  const emergencyMessage = `Critical health issue detected. User may have fallen or be unconscious. Location: ${currentLocation}`;
  const historyLogs = [
    { time: "Today, 14:22", type: "SpO2 Normal", message: "SpO2 recovered to 98%", status: "resolved" },
    { time: "Yesterday, 22:15", type: "Resting HR", message: "Resting HR dropped to optimal 62 bpm", status: "resolved" },
    { time: "3 days ago, 08:30", type: "System Check", message: "BLE Smart Ring sensor recalibrated", status: "info" },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(34,211,238,0.06)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Early Warning & Emergency System
            </h2>
            <p className="text-xs text-slate-400">
              On-Device Real-Time Anomaly Engine
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold font-mono">
          {activeWarnings.length} ACTIVE
        </span>
      </div>

      {/* Active Alerts Banner if any */}
      {activeWarnings.length > 0 && (
        <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-4 shadow-[0_0_25px_rgba(244,63,94,0.25)] space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 animate-bounce text-rose-400" />
            <span>Active Telemetry Warnings Detected!</span>
          </div>
          <div className="space-y-2">
            {activeWarnings.map((w, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-rose-500/40 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-rose-300">{w.title}</div>
                  <div className="text-slate-300 mt-0.5">{w.message}</div>
                </div>
                <span className="font-mono text-xs font-bold text-white bg-rose-950 px-2 py-1 rounded border border-rose-500/50">
                  {w.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {riskInsights && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Personal Physiology Analysis</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-2">
              <span className="block text-slate-500">Baseline HR</span>
              <strong className="text-cyan-400">{riskInsights.baselineHr === null ? "--" : `${riskInsights.baselineHr.toFixed(1)} bpm`}</strong>
            </div>
            <div className={`rounded-xl border p-2 ${riskInsights.dehydrationRisk === "High Risk" ? "border-rose-500/50 text-rose-300" : "border-slate-800 text-emerald-300"}`}>
              <span className="block text-slate-500">Dehydration</span>
              <strong>{riskInsights.dehydrationRisk}</strong>
            </div>
            <div className={`rounded-xl border p-2 ${riskInsights.fatigueRisk === "High Risk" ? "border-rose-500/50 text-rose-300" : "border-slate-800 text-emerald-300"}`}>
              <span className="block text-slate-500">Fatigue</span>
              <strong>{riskInsights.fatigueRisk}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Button & Contacts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Emergency SOS Dispatch
            </h3>
          </div>
          <span className={`text-[10px] font-mono ${sosDispatched ? "text-rose-400" : "text-cyan-400"}`}>
            {sosDispatched ? "SOS DISPATCHED" : "Monitoring Automated Thresholds..."}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="min-w-0">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Primary Contact</div>
            {isEditingContact ? (
              <input
                type="tel"
                value={contactDraft}
                onChange={(event) => setContactDraft(event.target.value)}
                placeholder="Enter emergency number"
                className="mt-1 w-full bg-transparent font-mono text-cyan-300 font-bold text-xs focus:outline-none"
              />
            ) : (
              <div className="font-mono text-cyan-300 font-bold text-xs mt-0.5">{emergencyPhone || "No number added"}</div>
            )}
          </div>
          <button
            onClick={() => {
              if (isEditingContact) {
                onSaveEmergencyPhone(contactDraft.trim());
              }
              setIsEditingContact(!isEditingContact);
            }}
            aria-label={isEditingContact ? "Save emergency contact" : "Add emergency contact"}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {isEditingContact ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        <div className={`p-3 rounded-xl border text-center text-xs font-bold ${sosDispatched ? "border-rose-500/60 bg-rose-500/10 text-rose-300" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"}`}>
          {sosDispatched ? "Emergency Services & Primary Contact Notified" : "Automated consciousness protection is active"}
        </div>

        {sosDispatched && emergencyPhone && (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${emergencyPhone}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-3 text-xs font-bold text-white"
            >
              <PhoneCall className="w-4 h-4" />
              Call Contact
            </a>
            <a
              href={`sms:${emergencyPhone}?body=${encodeURIComponent(emergencyMessage)}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-3 text-xs font-bold text-white"
            >
              <MessageSquare className="w-4 h-4" />
              Send Location SMS
            </a>
          </div>
        )}
      </div>

      {/* Resolved Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recent Vital Event History
        </h3>
        <div className="space-y-2">
          {historyLogs.map((log, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-200">{log.type}</span>
                <p className="text-[10px] text-slate-400">{log.message}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
