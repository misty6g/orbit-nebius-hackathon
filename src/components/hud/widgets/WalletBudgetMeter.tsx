"use client";

import React, { useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Wallet, Plus, ShieldCheck, Receipt } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface WalletBudgetMeterProps {
  brain: SharedBrainProfile;
  onUpdateBrain: (updated: SharedBrainProfile) => void;
}

export function WalletBudgetMeter({ brain, onUpdateBrain }: WalletBudgetMeterProps) {
  const [expenseItem, setExpenseItem] = useState("");
  const [expenseCost, setExpenseCost] = useState("");
  const [category, setCategory] = useState("Food");

  const expenses = brain.activity.expenses || [];
  const totalSpent = expenses.reduce((acc, e) => acc + e.cost, 0);
  const budgetCap = brain.goals.wallet.monthlyBudgetCap || 800;
  const remaining = Math.max(0, budgetCap - totalSpent);
  const spentPct = Math.min(100, Math.round((totalSpent / budgetCap) * 100));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseItem.trim() || !expenseCost) return;

    cosmicAudio.playClick();
    const costVal = parseFloat(expenseCost) || 0;

    const newExpense = {
      id: `e-${Date.now()}`,
      item: expenseItem.trim(),
      cost: costVal,
      category,
      date: "Today",
    };

    onUpdateBrain({
      ...brain,
      activity: {
        ...brain.activity,
        expenses: [newExpense, ...brain.activity.expenses],
      },
    });

    setExpenseItem("");
    setExpenseCost("");
  };

  return (
    <div className="space-y-4">
      {/* Monthly Budget Progress Meter */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-glass-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={18} weight="duotone" className="text-amber-400" />
            <h4 className="text-xs font-mono font-medium text-amber-300">
              Monthly Spend Meter ($800 Cap)
            </h4>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
            <ShieldCheck size={12} weight="bold" />
            Sovereign Ledger
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="text-[11px] font-mono text-zinc-400 mb-1">Spent This Month</div>
            <div className="text-xl font-mono font-semibold text-zinc-100">
              ${totalSpent.toFixed(2)}
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  spentPct > 85
                    ? "bg-rose-400"
                    : spentPct > 65
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-zinc-400 mt-1 text-right">
              {spentPct}% utilized
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="text-[11px] font-mono text-zinc-400 mb-1">Buffer Remaining</div>
            <div className="text-xl font-mono font-semibold text-emerald-300">
              ${remaining.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 mt-3 leading-relaxed">
              Soft limit checked before Travel and Deals proposals.
            </div>
          </div>
        </div>

        {/* Quick Expense Logger */}
        <form onSubmit={handleAddExpense} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={expenseItem}
              onChange={(e) => setExpenseItem(e.target.value)}
              placeholder="Log purchase (e.g. groceries, books)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
            />
            <input
              type="number"
              step="0.01"
              value={expenseCost}
              onChange={(e) => setExpenseCost(e.target.value)}
              placeholder="$ Amount"
              className="w-24 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-zinc-500 text-right focus:outline-none focus:border-amber-400/50 transition font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition active:scale-[0.98] flex items-center gap-1 shrink-0"
            >
              <Plus size={14} weight="bold" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Expense Ledger */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-glass-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-zinc-400">
            Recent Transactions
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {expenses.length} records
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Receipt size={14} className="text-amber-400 shrink-0" />
                <div>
                  <div className="font-medium text-zinc-200">{exp.item}</div>
                  <div className="text-[10px] font-mono text-zinc-500">{exp.category} • {exp.date}</div>
                </div>
              </div>
              <div className="font-mono text-zinc-100 font-medium">
                ${exp.cost.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
