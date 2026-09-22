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
    <div className="space-y-3 font-sans">
      {/* Athletics and Split Header */}
      <div className="p-4 rounded-xl bg-space-950/60 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Barbell size={16} weight="duotone" className="text-amber-400" />
            <h4 className="text-xs font-mono font-medium tracking-wide text-slate-200">
              4x/Week Split and Volleyball Coordination
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
            Game Day Protection Active
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Heavy leg workouts are scheduled off Friday and Saturday to protect match performance for RIT Men's Volleyball.
        </p>

        {/* Tab Selector */}
        <div className="inline-flex p-0.5 rounded-lg bg-space-900/80 border border-white/[0.06] mb-3">
          <button
            onClick={() => setActiveTab("split")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "split"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Weekly Matrix
          </button>
          <button
            onClick={() => setActiveTab("prs")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "prs"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            PR Board
          </button>
        </div>

        {activeTab === "split" ? (
          <div className="space-y-1.5">
            {workouts.map((w) => (
              <div
                key={w.id}
                onClick={() => toggleWorkout(w.id)}
                className="p-3 rounded-lg bg-space-900/40 border border-white/[0.05] hover:border-white/[0.12] transition cursor-pointer flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-200">
                      {w.day}: {w.focus}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                        w.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/5 text-slate-400 border border-white/5"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {w.exercises.join(" • ")}
                  </div>
                </div>
                <div className="text-amber-400 pt-0.5 shrink-0 ml-2">
                  {w.status === "completed" ? (
                    <CheckSquareOffset size={18} weight="fill" className="text-emerald-400" />
                  ) : (
                    <Square size={18} weight="regular" className="text-slate-600 hover:text-slate-400 transition" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {personalRecords.map((pr, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-space-900/40 border border-white/[0.05] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Trophy size={15} weight="duotone" className="text-amber-400" />
                  <span className="font-medium text-slate-200">{pr.lift}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-amber-300 font-semibold">{pr.weight}</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-1.5">({pr.reps})</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
