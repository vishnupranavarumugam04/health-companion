"use client";

import React, { useState } from "react";
import { LayoutDashboard, Clock, Bell, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  unreadAlertsCount?: number;
  onSelectTab: (tabName: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  unreadAlertsCount = 0,
  onSelectTab,
}) => {
  const handleTabClick = (id: string) => {
    onSelectTab(id);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "History", icon: Clock },
    { id: "alerts", label: "Alerts", icon: Bell, badge: unreadAlertsCount },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-1 pointer-events-none">
      <nav className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl px-6 py-2.5 shadow-[0_-4px_25px_rgba(2,6,23,0.8)] pointer-events-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="relative flex flex-col items-center justify-center p-2 group transition-all"
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    isActive
                      ? "text-cyan-400 drop-shadow-[0_0_8px_#22d3ee] scale-110"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                />

                {/* Badge if alerts count > 0 */}
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              {/* Glowing cyan dot under active icon */}
              {isActive ? (
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              ) : (
                <span className="mt-1 w-1.5 h-1.5 rounded-full opacity-0" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
