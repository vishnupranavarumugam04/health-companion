import React from "react";
import { BrainCircuit, AlertTriangle, CheckCircle2, AlertOctagon } from "lucide-react";

interface EdgeAIHealthCardProps {
  status: string;
  confidence: number;
  lastUpdated: number | null;
}

export const EdgeAIHealthCard: React.FC<EdgeAIHealthCardProps> = ({
  status,
  confidence,
  lastUpdated,
}) => {
  const displayStatus = status.replace(/_/g, " ");
  const confidencePercent = (confidence * 100).toFixed(2);

  let statusColor = "text-slate-400";
  let bgColor = "bg-slate-900/60 border-slate-800/80";
  let Icon = BrainCircuit;

  switch (status) {
    case "NORMAL":
      statusColor = "text-emerald-400";
      bgColor = "bg-emerald-900/20 border-emerald-800/50";
      Icon = CheckCircle2;
      break;
    case "HEAT_STRESS_RISK":
      statusColor = "text-amber-400";
      bgColor = "bg-amber-900/20 border-amber-800/50";
      Icon = AlertTriangle;
      break;
    case "RESPIRATORY_RISK":
      statusColor = "text-orange-500";
      bgColor = "bg-orange-900/20 border-orange-800/50";
      Icon = AlertTriangle;
      break;
    case "HIGH_RISK":
      statusColor = "text-red-500";
      bgColor = "bg-red-900/30 border-red-800/60";
      Icon = AlertOctagon;
      break;
    case "AI WAITING":
      statusColor = "text-slate-400";
      break;
    case "AI ERROR":
      statusColor = "text-red-400";
      Icon = AlertTriangle;
      break;
  }

  return (
    <div className={`mt-6 border rounded-2xl p-5 shadow-lg backdrop-blur-xl animate-fade-in ${bgColor}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-200 tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          EDGE AI HEALTH ANALYSIS
        </h3>
      </div>
      
      {status === "AI WAITING" ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Waiting for Edge AI data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 ${statusColor}`} />
            <div>
              <p className={`text-2xl font-black tracking-tight ${statusColor}`}>
                {displayStatus}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Confidence: <span className="font-bold text-slate-300">{confidencePercent}%</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        <p className="text-[10px] text-slate-500 italic">
          Edge AI result is an assistive prototype indicator, not a medical diagnosis.
        </p>
        {lastUpdated && (
          <p className="text-[10px] text-slate-500">
            {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};
