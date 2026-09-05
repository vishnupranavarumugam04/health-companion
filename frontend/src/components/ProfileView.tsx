"use client";

import React, { useState } from "react";
import { User, Cpu, ShieldCheck, Lock, Radio, Battery, Zap, Award, Sparkles, Check, ChevronRight } from "lucide-react";

export const ProfileView: React.FC = () => {
  const [zeroCloudPrivacy, setZeroCloudPrivacy] = useState<boolean>(true);
  const [federatedLearning, setFederatedLearning] = useState<boolean>(true);
  const [spaMAEngine, setSpaMAEngine] = useState<boolean>(true);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Top User Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(34,211,238,0.06)] relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_#22d3ee]">
              <User className="w-8 h-8" />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-[0_0_8px_#22d3ee]" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Pranav
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                SIH USER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personal Health Companion Profile
            </p>
            <div className="flex gap-3 text-[10px] font-mono text-slate-500 mt-1">
              <span>Age: 22</span>
              <span>•</span>
              <span>Blood: O+</span>
              <span>•</span>
              <span>Weight: 68 kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIH Hackathon Project Card */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(34,211,238,0.08)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                SIH 2026 Hackathon Prototype
              </h3>
              <p className="text-[10px] text-cyan-400 font-mono">
                Problem Statement ID: SIH26181
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-extrabold uppercase shadow-[0_0_10px_#22d3ee]">
            KPSPlayz
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Mobile-centric architecture offloading screen &amp; heavy AI computation to the smartphone, achieving 24/7 continuous smart ring telemetry.
        </p>
      </div>

      {/* Hardware Teardown & Spec Stack (SIH Slide 3 Specifications) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Screen-Free Smart Ring Specs
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            0.48mm Rigid-Flex
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">SoC Microcontroller</div>
            <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">Dialog DA14531</div>
            <div className="text-[9px] text-slate-500">Ultra-low power BLE 5.1</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Power Management</div>
            <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">TI BQ2512x PMIC</div>
            <div className="text-[9px] text-slate-500">Curved band stackup</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Wireless Charging</div>
            <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">6.78 MHz Induction</div>
            <div className="text-[9px] text-slate-500">Portless waterproof seal</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Battery &amp; Status</div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
              <Battery className="w-3.5 h-3.5" />
              <span>84% (5 Days)</span>
            </div>
            <div className="text-[9px] text-slate-500">Induction Charged</div>
          </div>
        </div>
      </div>

      {/* Zero-Cloud Privacy & On-Device AI Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Zero-Cloud Privacy Controls
            </h3>
          </div>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="space-y-3">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Zero-Cloud On-Device Processing</div>
              <div className="text-[10px] text-slate-400">All health raw data stored &amp; processed locally</div>
            </div>
            <button
              onClick={() => setZeroCloudPrivacy(!zeroCloudPrivacy)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                zeroCloudPrivacy ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  zeroCloudPrivacy ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Federated Learning Node</div>
              <div className="text-[10px] text-slate-400">Homomorphic encrypted model updates without raw data</div>
            </div>
            <button
              onClick={() => setFederatedLearning(!federatedLearning)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                federatedLearning ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  federatedLearning ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">SpaMA Neural Spectral Filter</div>
              <div className="text-[10px] text-slate-400">TensorFlow Lite motion noise erasure active</div>
            </div>
            <button
              onClick={() => setSpaMAEngine(!spaMAEngine)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                spaMAEngine ? "bg-cyan-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  spaMAEngine ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
