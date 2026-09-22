"use client";

import React from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Brain, X, ShieldCheck, User, Target, Lightning } from "@phosphor-icons/react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="w-full max-w-xl max-h-[85vh] p-6 rounded-2xl bg-space-900/95 border border-white/15 shadow-glass-lg text-white relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Brain size={18} weight="duotone" />
            </span>
            <div>
              <h3 className="text-sm font-display font-semibold text-white">
                Sovereign Shared Brain Inspector
              </h3>
              <p className="text-[10px] font-mono text-gray-400">
                Single Unified Memory Layer across All Specialists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Student Identity */}
          <div className="p-3 rounded-xl bg-space-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-300">
              <User size={14} />
              <span>Student Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-gray-500">Name: </span>
                <span className="text-gray-200">{brain.student.name}</span>
              </div>
              <div>
                <span className="text-gray-500">University: </span>
                <span className="text-gray-200">{brain.student.university}</span>
              </div>
              <div>
                <span className="text-gray-500">Degree: </span>
                <span className="text-gray-200">{brain.student.degree} ({brain.student.gradYear})</span>
              </div>
              <div>
                <span className="text-gray-500">Home Airport: </span>
                <span className="text-gray-200">{brain.student.homeAirport}</span>
              </div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="p-3 rounded-xl bg-space-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-300">
              <Target size={14} />
              <span>Active Goals & Guardrails</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-gray-500">Nutrition: </span>
                <span className="text-emerald-400">
                  Bulk (~{brain.goals.nutrition.caloriesTarget} kcal, {brain.goals.nutrition.proteinTarget}g protein)
                </span>
              </div>
              <div>
                <span className="text-gray-500">Athletics: </span>
                <span className="text-orange-400">
                  {brain.goals.workout.split} + {brain.goals.workout.sports.join(", ")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Wallet Limit: </span>
                <span className="text-amber-400">${brain.goals.wallet.monthlyBudgetCap}/month soft cap</span>
              </div>
              <div>
                <span className="text-gray-500">Career Focus: </span>
                <span className="text-indigo-400">{brain.goals.career.targetSeason} SWE / ML</span>
              </div>
            </div>
          </div>

          {/* Activity Logs Count */}
          <div className="p-3 rounded-xl bg-space-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-300">
              <Lightning size={14} />
              <span>Sovereign Activity Logs</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center">
              <div className="p-2 rounded bg-space-900 border border-white/5">
                <div className="text-base font-semibold text-emerald-400">
                  {brain.activity.meals.length}
                </div>
                <div className="text-[10px] text-gray-400">Logged Meals</div>
              </div>
              <div className="p-2 rounded bg-space-900 border border-white/5">
                <div className="text-base font-semibold text-orange-400">
                  {brain.activity.workouts.length}
                </div>
                <div className="text-[10px] text-gray-400">Workouts</div>
              </div>
              <div className="p-2 rounded bg-space-900 border border-white/5">
                <div className="text-base font-semibold text-amber-400">
                  {brain.activity.expenses.length}
                </div>
                <div className="text-[10px] text-gray-400">Transactions</div>
              </div>
            </div>
          </div>

          {/* Privacy Architecture Notice */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
            <ShieldCheck size={16} weight="bold" className="shrink-0 text-emerald-400 mt-0.5" />
            <p className="leading-relaxed">
              Orbit's Sovereign Architecture: Memory stays on client storage and direct encrypted API calls. Zero external telemetry sold, zero data silos between bots.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 font-display text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
