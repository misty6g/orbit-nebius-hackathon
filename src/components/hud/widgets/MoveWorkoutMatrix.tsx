"use client";

import React, { useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Barbell, Trophy, CheckSquareOffset, Square } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface MoveWorkoutMatrixProps {
  brain: SharedBrainProfile;
  onUpdateBrain: (updated: SharedBrainProfile) => void;
}

export function MoveWorkoutMatrix({ brain, onUpdateBrain }: MoveWorkoutMatrixProps) {
  const workouts = brain.activity.workouts || [];
  const [activeTab, setActiveTab] = useState<"split" | "prs">("split");

  const toggleWorkout = (id: string) => {
    cosmicAudio.playClick();
    const updatedWorkouts = workouts.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          status: (w.status === "completed" ? "upcoming" : "completed") as "completed" | "upcoming",
        };
      }
      return w;
    });

    onUpdateBrain({
      ...brain,
      activity: {
        ...brain.activity,
        workouts: updatedWorkouts,
      },
    });
  };

  const personalRecords = [
    { lift: "Barbell Back Squat", weight: "275 lb", reps: "3 reps", date: "Last week" },
    { lift: "Bench Press", weight: "215 lb", reps: "4 reps", date: "2 weeks ago" },
    { lift: "Romanian Deadlift", weight: "225 lb", reps: "8 reps", date: "3 weeks ago" },
    { lift: "Overhead Press", weight: "135 lb", reps: "5 reps", date: "1 month ago" },
  ];

  return (
    <div className="space-y-4">
      {/* Athletics and Split Header */}
      <div className="p-4 rounded-xl bg-space-900/80 border border-orange-500/20 backdrop-blur-md shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Barbell size={18} weight="duotone" className="text-orange-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-300">
              4x/Week Split and Volleyball Coordination
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
            Game Day Protection Active
          </span>
        </div>
        <p className="text-xs text-gray-300 mb-3">
          Heavy leg workouts are scheduled off Friday and Saturday to protect match performance for RIT Men's Volleyball.
        </p>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-white/10 pb-2 mb-3">
          <button
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1 rounded text-xs font-display transition ${
              activeTab === "split"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Weekly Matrix
          </button>
          <button
            onClick={() => setActiveTab("prs")}
            className={`px-3 py-1 rounded text-xs font-display transition ${
              activeTab === "prs"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                : "text-gray-400 hover:text-white"
            }`}
          >
            PR Board
          </button>
        </div>

        {activeTab === "split" ? (
          <div className="space-y-2">
            {workouts.map((w) => (
              <div
                key={w.id}
                onClick={() => toggleWorkout(w.id)}
                className="p-3 rounded-lg bg-space-950/60 border border-white/5 hover:border-orange-500/30 transition cursor-pointer flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-medium text-white">
                      {w.day}: {w.focus}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                        w.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-800 text-gray-400"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400">
                    {w.exercises.join(" • ")}
                  </div>
                </div>
                <div className="text-orange-400 pt-0.5">
                  {w.status === "completed" ? (
                    <CheckSquareOffset size={18} weight="fill" className="text-emerald-400" />
                  ) : (
                    <Square size={18} weight="regular" className="text-gray-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {personalRecords.map((pr, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-space-950/60 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Trophy size={16} weight="duotone" className="text-amber-400" />
                  <span className="font-display font-medium text-white">{pr.lift}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-orange-300 font-semibold">{pr.weight}</span>
                  <span className="text-[10px] font-mono text-gray-400 ml-1.5">({pr.reps})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
