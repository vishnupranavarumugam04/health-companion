"use client";

import React, { useState } from "react";
import { NotificationItem } from "@/types/health";
import { getStoredNotifications, saveStoredNotifications } from "@/utils/storage";
import { Bell, AlertTriangle, Sparkles, CheckCircle2, Volume2, PartyPopper, Inbox } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>(getStoredNotifications);

  const handleAddCheer = () => {
    const newCheer: NotificationItem = {
      id: Date.now().toString(),
      type: "cheer",
      title: "Active Participation Cheering! 🏃‍♂️🎉",
      message: "Outstanding walking effort! You hit your hourly step goal. Heart recovery is optimal!",
      timestamp: "Just now",
      read: false,
    };
    const updated = [newCheer, ...items];
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const handleAddRiskAlert = () => {
    const newRisk: NotificationItem = {
      id: Date.now().toString(),
      type: "risk",
      title: "Abnormal Vital Alert Detected",
      message: "Warning: High resting heart rate (132 bpm) detected during rest. SpaMA AI advises relaxation.",
      timestamp: "Just now",
      read: false,
    };
    const updated = [newRisk, ...items];
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = items.map((i) => ({ ...i, read: true }));
    setItems(updated);
    saveStoredNotifications(updated);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Notifications &amp; AI Cheering Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Abnormal Vital Risk Alerts &amp; Activity Motivation
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Interactive Trigger Controls (SIH Requirement) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Test Notification Triggers</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Alert Test</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleAddCheer}
            className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PartyPopper className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Trigger Cheering Notification</span>
          </button>

          <button
            onClick={handleAddRiskAlert}
            className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Trigger Risk Warning Alert</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const isRisk = item.type === "risk";
            const isCheer = item.type === "cheer";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl border transition-all shadow-sm ${
                  isRisk
                    ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60"
                    : isCheer
                    ? "bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/60"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isRisk
                        ? "bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400"
                        : isCheer
                        ? "bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isRisk ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isCheer ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold ${
                          isRisk
                            ? "text-rose-900 dark:text-rose-200"
                            : isCheer
                            ? "text-teal-900 dark:text-teal-200"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Active Alerts or Notifications</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Live abnormal vital alerts and walking cheering notifications will be logged here in real time.
          </p>
        </div>
      )}
    </div>
  );
};
