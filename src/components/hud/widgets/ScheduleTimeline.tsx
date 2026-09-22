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
      <div className="p-4 rounded-xl bg-space-900/80 border border-cyan-500/20 backdrop-blur-md shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} weight="duotone" className="text-cyan-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
              Primary Academic and Volleyball Feed
            </h4>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Lock size={11} weight="bold" />
            Confirm Before Writes
          </span>
        </div>

        <p className="text-xs text-gray-300 mb-3">
          Synchronized with RIT academic portal and Google Calendar. Free block detection automatically coordinates study holds.
        </p>

        {/* Timeline Events */}
        <div className="space-y-2.5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-lg border text-xs transition ${
                evt.isHold
                  ? "bg-cyan-950/30 border-cyan-500/30 text-cyan-100"
                  : "bg-space-950/60 border-white/5 text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-display font-medium flex items-center gap-1.5">
                  {evt.isHold && <Sparkle size={13} weight="fill" className="text-cyan-400" />}
                  <span>{evt.title}</span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    evt.category === "class"
                      ? "bg-blue-500/20 text-blue-300"
                      : evt.category === "sports"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-cyan-500/20 text-cyan-300"
                  }`}
                >
                  {evt.isHold ? "Pending Hold" : evt.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                <Clock size={12} />
                <span>{evt.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-3 mt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onRequestHold}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-medium text-xs transition active:scale-[0.98]"
          >
            <Plus size={14} weight="bold" />
            <span>Propose Study Hold</span>
          </button>
        </div>
      </div>
    </div>
  );
}
