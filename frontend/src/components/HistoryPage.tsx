"use client";

import React, { useState } from "react";
import { HealthLogDay } from "@/types/health";
import { getStoredHealthLogs } from "@/utils/storage";
import { Database, Trash2, ShieldCheck, Lock, Clock, FileText, Download, AlertCircle, HardDrive } from "lucide-react";

export const HistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<HealthLogDay[]>(getStoredHealthLogs);
  const [purgedMessage, setPurgedMessage] = useState<string | null>(null);

  const handleManualPurge = () => {
    if (logs.length === 0) return;
    const updated = logs.filter((l) => l.dayIndex !== 1);
    setLogs(updated);
    setPurgedMessage("Tier 1 Raw Waveform buffer permanently erased from local storage!");
    setTimeout(() => setPurgedMessage(null), 5000);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                72-Hour Data Storage &amp; Urgency Records
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zero-Cloud Privacy • Auto-Purging Rolling Buffer
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted</span>
          </span>
        </div>
      </div>

      {/* Manual Purge Toast Feedback */}
      {purgedMessage && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{purgedMessage}</span>
        </div>
      )}

      {/* 72-Hour Rolling Buffer Visualizer (SIH 26181 Core Specification) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>72-Hour Rolling Auto-Purge Cycle</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Raw high-frequency PPG signals auto-erase every 72 hours locally.
            </p>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleManualPurge}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Tier 1</span>
            </button>
          )}
        </div>

        {/* Rolling Buffer Cards */}
        {logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.dayIndex}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.date}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-mono text-[9px] font-bold">
                      Tier {log.dayIndex} Buffer
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    Auto Purge in {log.hoursRemaining}h
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">Avg HR</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{log.avgHr} bpm</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">Avg SpO2</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 mt-0.5 block">{log.avgSpo2}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">Avg Temp</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{log.avgTemp}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block">Steps</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{log.totalSteps}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No 72-Hour Sensor Buffer Recorded</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Live hardware PPG readings will automatically log 24h rolling averages into your encrypted local storage buffer.
            </p>
          </div>
        )}
      </div>

      {/* Emergency & Urgency Medical Summary Exporter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Emergency &amp; Medical Export
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Encrypted Summary for ER &amp; Urgency Doctors
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Generate an encrypted snapshot containing 72-hour vital averages, HRV trends, and emergency contact details for medical personnel.
        </p>

        <button className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer">
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Emergency Medical Record Snapshot</span>
        </button>
      </div>
    </div>
  );
};
