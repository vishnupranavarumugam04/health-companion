"use client";

import React from "react";
import { LayoutDashboard, Clock, Bell, User } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  unreadCount?: number;
  onSelectTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  unreadCount = 0,
  onSelectTab,
}) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "72h History", icon: Clock },
    { id: "notifications", label: "Alerts", icon: Bell, badge: unreadCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-1 pointer-events-none">
      <nav className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl px-6 py-2.5 shadow-lg pointer-events-auto flex items-center justify-between transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex flex-col items-center justify-center p-2 group transition-all"
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-teal-600 dark:text-teal-400 scale-110"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                />

                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[10px] font-semibold mt-1 transition-colors ${
                  isActive
                    ? "text-teal-600 dark:text-teal-400 font-bold"
                    : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
