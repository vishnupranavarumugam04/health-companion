"use client";

import React from "react";
import { AlertTriangle, Heart, Droplet, Thermometer } from "lucide-react";

export interface EarlyWarningItem {
  type: "spo2" | "hr" | "temp" | "fall";
  title: string;
  message: string;
  value: string | number;
}

export interface DisasterAlert {
  type: string;
  severity: string;
  instruction: string;
}

interface EarlyWarningModalProps {
  warnings: EarlyWarningItem[];
  countdown: number;
  sosDispatched: boolean;
  emergencyPhone: string;
  disasterAlert?: DisasterAlert | null;
  onDismissDisasterAlert: () => void;
  onCancelSos: () => void;
  onSendSos: () => void;
}

export const EarlyWarningModal: React.FC<EarlyWarningModalProps> = ({
  warnings,
  countdown,
  sosDispatched,
  emergencyPhone,
  disasterAlert,
  onDismissDisasterAlert,
  onCancelSos,
  onSendSos,
}) => {
  if (disasterAlert) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-rose-950/95 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-lg rounded-2xl border-4 border-amber-400 bg-slate-950 p-7 text-center shadow-[0_0_60px_rgba(245,158,11,0.55)] animate-pulse">
          <AlertTriangle className="mx-auto h-16 w-16 text-amber-400" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-amber-300">Disaster Alert · {disasterAlert.severity}</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">{disasterAlert.type}</h2>
          <p className="mt-5 text-lg font-bold text-rose-100">{disasterAlert.instruction}</p>
          <p className="mt-4 text-xs text-amber-200">Priority hazard alert overrides standard health warnings.</p>
          <button
            type="button"
            onClick={onDismissDisasterAlert}
            className="mt-6 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-amber-300"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    );
  }

  if (warnings.length === 0 && !sosDispatched) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.5)] relative overflow-hidden animate-scale-up">
        {/* Top Emergency Pulse Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-bounce">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Consciousness Check</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold uppercase">
                CRITICAL
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              CRITICAL VITALS DETECTED. ARE YOU CONSCIOUS?
            </p>
          </div>
        </div>

        {/* Warnings List */}
        <div className="space-y-3 my-4">
          {warnings.map((w, index) => {
            const IconComponent =
              w.type === "hr"
                ? Heart
                : w.type === "spo2"
                ? Droplet
                : w.type === "temp"
                ? Thermometer
                : AlertTriangle;

            return (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 flex items-start gap-3 shadow-inner"
              >
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5">
                  <IconComponent className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                      {w.title}
                    </h4>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {w.value}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 mt-1">
                    {w.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {!sosDispatched ? (
          <>
            <div className="my-5 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-300">Response required in</p>
              <p className="mt-1 text-6xl font-black font-mono text-white tabular-nums">{countdown}</p>
            </div>
            <div className="mt-5 space-y-3">
              <button
                onClick={onCancelSos}
                className="w-full py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all"
              >
                I AM OK (CANCEL SOS)
              </button>
              <button
                onClick={onSendSos}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all"
              >
                SEND SOS NOW
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-rose-500/50 bg-rose-950/50 p-5 text-center">
            <p className="text-xl font-black tracking-wide text-rose-300">SOS DISPATCHED</p>
            <p className="mt-2 text-sm font-medium text-slate-200">
                Emergency Intent Dispatched via Cellular Link (SMS/TEL) with Encrypted GPS &amp; Vitals
            </p>
            {emergencyPhone && (
              <a
                href={`tel:${emergencyPhone}`}
                className="mt-4 block rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              >
                CALL {emergencyPhone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
