"use client";

import React, { useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { ForkKnife, Plus, Sparkle, Fire } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface HealthMacroRingsProps {
  brain: SharedBrainProfile;
  onUpdateBrain: (updated: SharedBrainProfile) => void;
}

export function HealthMacroRings({ brain, onUpdateBrain }: HealthMacroRingsProps) {
  const [foodName, setFoodName] = useState("");
  const [estCalories, setEstCalories] = useState("650");
  const [estProtein, setEstProtein] = useState("45");

  const meals = brain.activity.meals || [];
  const totalCalsMin = meals.reduce((acc, m) => acc + m.caloriesMin, 0);
  const totalCalsMax = meals.reduce((acc, m) => acc + m.caloriesMax, 0);
  const totalCalsAvg = Math.round((totalCalsMin + totalCalsMax) / 2);
  const totalProtein = meals.reduce((acc, m) => acc + m.proteinGrams, 0);

  const calTarget = brain.goals.nutrition.caloriesTarget || 3100;
  const proteinTarget = brain.goals.nutrition.proteinTarget || 170;

  const calPct = Math.min(100, Math.round((totalCalsAvg / calTarget) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    cosmicAudio.playClick();
    const cVal = parseInt(estCalories) || 600;
    const pVal = parseInt(estProtein) || 35;

    const newMeal = {
      id: `m-${Date.now()}`,
      name: foodName.trim(),
      caloriesMin: Math.round(cVal * 0.95),
      caloriesMax: Math.round(cVal * 1.05),
      proteinGrams: pVal,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = {
      ...brain,
      activity: {
        ...brain.activity,
        meals: [newMeal, ...brain.activity.meals],
      },
    };

    onUpdateBrain(updated);
    setFoodName("");
  };

  return (
    <div className="space-y-4">
      {/* Target and Ring Progress Card */}
      <div className="p-4 rounded-xl bg-space-900/80 border border-emerald-500/20 backdrop-blur-md shadow-glass-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Fire size={18} weight="duotone" className="text-emerald-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
              Bulk Target Pacing (3,100 kcal)
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Honest Ranges Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-space-950/60 border border-white/5">
            <div className="text-[11px] font-mono text-gray-400 mb-1">Calories Pacing</div>
            <div className="text-lg font-display font-semibold text-white">
              {totalCalsMin}-{totalCalsMax} <span className="text-xs font-normal text-gray-400">kcal</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${calPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-gray-400 mt-1 text-right">
              {calPct}% of {calTarget}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-space-950/60 border border-white/5">
            <div className="text-[11px] font-mono text-gray-400 mb-1">Protein Intake</div>
            <div className="text-lg font-display font-semibold text-white">
              {totalProtein} <span className="text-xs font-normal text-gray-400">/ {proteinTarget}g</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-gray-400 mt-1 text-right">
              {proteinPct}% of {proteinTarget}g
            </div>
          </div>
        </div>

        {/* Quick Food Log Bar */}
        <form onSubmit={handleAddMeal} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Log meal (e.g. Chipotle chicken bowl + guac)"
              className="flex-1 px-3 py-2 rounded-lg bg-space-950/80 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-400 transition"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-semibold text-xs transition active:scale-[0.98] flex items-center gap-1 shrink-0"
            >
              <Plus size={14} weight="bold" />
              <span>Log</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
            <span>Est. Calories:</span>
            <input
              type="number"
              value={estCalories}
              onChange={(e) => setEstCalories(e.target.value)}
              className="w-16 px-1.5 py-0.5 rounded bg-space-950 border border-white/10 text-white text-center"
            />
            <span>Protein (g):</span>
            <input
              type="number"
              value={estProtein}
              onChange={(e) => setEstProtein(e.target.value)}
              className="w-14 px-1.5 py-0.5 rounded bg-space-950 border border-white/10 text-white text-center"
            />
          </div>
        </form>
      </div>

      {/* Logged Meals List */}
      <div className="p-4 rounded-xl bg-space-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium text-gray-400 uppercase">
            Today's Logged Nutrition
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {meals.length} entries
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-2.5 rounded-lg bg-space-950/50 border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-display font-medium text-white">{meal.name}</div>
                <div className="text-[10px] font-mono text-gray-400">{meal.time}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-emerald-300">
                  {meal.caloriesMin}-{meal.caloriesMax} kcal
                </div>
                <div className="text-[10px] font-mono text-teal-400">
                  {meal.proteinGrams}g protein
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
