"use client";

import React, { ReactNode } from "react";
import { ChevronRight, LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  isWarning?: boolean;
  bottomGraphic: ReactNode;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  isWarning = false,
  bottomGraphic,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative bg-slate-900 border ${
        isWarning
          ? "border-rose-500/80 bg-slate-900/90 shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-pulse"
          : "border-slate-800 hover:border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.06)] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
      } rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 overflow-hidden cursor-pointer`}
    >
      {/* Top row: Icon + Label on left, ChevronRight on top right */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${
              isWarning 
                ? "bg-rose-500/20 border-rose-500/40 text-rose-400" 
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            }`}>
              <Icon className={`w-4 h-4 ${isWarning ? "text-rose-400" : "text-cyan-400"}`} />
            </div>
            <span className={`text-xs sm:text-sm font-medium ${isWarning ? "text-rose-300 font-semibold" : "text-slate-400"}`}>
              {label}
            </span>
          </div>

          <ChevronRight className={`w-4 h-4 transition-all ${isWarning ? "text-rose-400" : "text-slate-500 group-hover:text-cyan-400"}`} />
        </div>

        {/* Primary Value */}
        <div className="mt-1">
          <span
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isWarning ? "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "text-white"
            }`}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Bottom Graphic Slot */}
      <div className="mt-4 pt-2 border-t border-slate-800/40">
        {bottomGraphic}
      </div>
    </div>
  );
};
