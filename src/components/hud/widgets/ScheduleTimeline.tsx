"use client";

import React from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Calendar, Clock, Lock, Sparkle, Plus } from "@phosphor-icons/react";

interface ScheduleTimelineProps {
  brain: SharedBrainProfile;
  onRequestHold?: () => void;
}

export function ScheduleTimeline({ brain, onRequestHold }: ScheduleTimelineProps) {
  const events = brain.activity.calendar || [];

  return (
    <div className="space-y-4">
      {/* Connector Header */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} weight="duotone" className="text-cyan-400" />
            <h4 className="text-xs font-mono font-medium text-cyan-300">
              Primary Academic and Volleyball Feed
            </h4>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
            <Lock size={11} weight="bold" />
            Confirm Before Writes
          </span>
        </div>

        <p className="text-xs text-zinc-300 mb-3.5 leading-relaxed">
          Synchronized with RIT academic portal and Google Calendar. Free block detection automatically coordinates study holds.
        </p>

        {/* Timeline Events */}
        <div className="space-y-2">
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border text-xs transition ${
                evt.isHold
                  ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-100"
                  : "bg-zinc-900/50 border-white/5 text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium flex items-center gap-1.5">
                  {evt.isHold && <Sparkle size={13} weight="fill" className="text-cyan-400" />}
                  <span>{evt.title}</span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    evt.category === "class"
                      ? "bg-zinc-800 text-cyan-300 border border-cyan-500/20"
                      : evt.category === "sports"
                      ? "bg-zinc-800 text-amber-300 border border-amber-500/20"
                      : "bg-zinc-800 text-zinc-300 border border-white/10"
                  }`}
                >
                  {evt.isHold ? "Pending Hold" : evt.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                <Clock size={12} />
                <span>{evt.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-3 mt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onRequestHold}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition active:scale-[0.98]"
          >
            <Plus size={14} weight="bold" />
            <span>Propose Study Hold</span>
          </button>
        </div>
      </div>
    </div>
  );
}
