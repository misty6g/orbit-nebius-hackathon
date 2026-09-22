"use client";

import React from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Brain, X, ShieldCheck, User, Target, Lightning, DownloadSimple } from "@phosphor-icons/react";

interface BrainInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brain: SharedBrainProfile;
}

export function BrainInspectorModal({
  isOpen,
  onClose,
  brain,
}: BrainInspectorModalProps) {
  if (!isOpen) return null;

  const handleExportVault = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(brain, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `orbit_sovereign_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[85vh] p-6 rounded-2xl bg-[#090b0e] border border-white/[0.1] shadow-zen-dock text-slate-100 relative flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Brain size={16} weight="duotone" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Sovereign Shared Brain Inspector
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Single Unified Memory Layer across All Specialists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {/* Student Identity */}
          <div className="p-3.5 rounded-xl bg-space-900/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-amber-300">
              <User size={13} />
              <span>Student Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500">Name: </span>
                <span className="text-slate-200">{brain.student.name}</span>
              </div>
              <div>
                <span className="text-slate-500">University: </span>
                <span className="text-slate-200">{brain.student.university}</span>
              </div>
              <div>
                <span className="text-slate-500">Degree: </span>
                <span className="text-slate-200">{brain.student.degree} ({brain.student.gradYear})</span>
              </div>
              <div>
                <span className="text-slate-500">Home Airport: </span>
                <span className="text-slate-200">{brain.student.homeAirport}</span>
              </div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="p-3.5 rounded-xl bg-space-900/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-amber-300">
              <Target size={13} />
              <span>Active Goals & Guardrails</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500">Nutrition: </span>
                <span className="text-slate-200">
                  Bulk (~{brain.goals.nutrition.caloriesTarget} kcal, {brain.goals.nutrition.proteinTarget}g protein)
                </span>
              </div>
              <div>
                <span className="text-slate-500">Athletics: </span>
                <span className="text-slate-200">
                  {brain.goals.workout.split} + {brain.goals.workout.sports.join(", ")}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Wallet Limit: </span>
                <span className="text-slate-200">${brain.goals.wallet.monthlyBudgetCap}/month soft cap</span>
              </div>
              <div>
                <span className="text-slate-500">Career Focus: </span>
                <span className="text-slate-200">{brain.goals.career.targetSeason} SWE / ML</span>
              </div>
            </div>
          </div>

          {/* Activity Logs Count */}
          <div className="p-3.5 rounded-xl bg-space-900/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-amber-300">
              <Lightning size={13} />
              <span>Sovereign Activity Logs</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
              <div className="p-2 rounded-lg bg-space-950/80 border border-white/[0.04]">
                <div className="text-base font-semibold text-emerald-400">
                  {brain.activity.meals.length}
                </div>
                <div className="text-[10px] text-slate-500">Logged Meals</div>
              </div>
              <div className="p-2 rounded-lg bg-space-950/80 border border-white/[0.04]">
                <div className="text-base font-semibold text-amber-400">
                  {brain.activity.workouts.length}
                </div>
                <div className="text-[10px] text-slate-500">Workouts</div>
              </div>
              <div className="p-2 rounded-lg bg-space-950/80 border border-white/[0.04]">
                <div className="text-base font-semibold text-slate-200">
                  {brain.activity.expenses.length}
                </div>
                <div className="text-[10px] text-slate-500">Transactions</div>
              </div>
            </div>
          </div>

          {/* Privacy Architecture Notice */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-start gap-2">
            <ShieldCheck size={16} weight="bold" className="shrink-0 text-emerald-400 mt-0.5" />
            <p className="leading-relaxed">
              Orbit's Sovereign Architecture: Memory stays on client storage and direct encrypted API calls. Zero external telemetry sold, zero data silos between bots.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <button
            onClick={handleExportVault}
            className="zen-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono transition active:scale-[0.98]"
            title="Download client-side JSON backup of your entire Sovereign Brain"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export Sovereign Vault (.json)</span>
          </button>
          <button
            onClick={onClose}
            className="zen-btn px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
