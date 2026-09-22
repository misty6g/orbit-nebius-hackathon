"use client";

import React from "react";
import { SharedBrainProfile, MorningBriefData } from "@/types/orbit";
import { SunHorizon, PlayCircle, CalendarCheck, Envelope, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface CoreBriefWidgetProps {
  brain: SharedBrainProfile;
  brief: MorningBriefData | null;
  onPlayMorningTour: () => void;
  onOpenBrainInspector: () => void;
}

export function CoreBriefWidget({
  brain,
  brief,
  onPlayMorningTour,
  onOpenBrainInspector,
}: CoreBriefWidgetProps) {
  const handlePlayTour = () => {
    cosmicAudio.playWarp();
    onPlayMorningTour();
  };

  return (
    <div className="space-y-4">
      {/* Morning Brief Card */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SunHorizon size={18} weight="duotone" className="text-amber-400" />
            <h4 className="text-xs font-mono font-medium text-amber-300">
              Solar Dawn Morning Brief
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {brief?.date || "Today"}
          </span>
        </div>

        <p className="text-xs text-zinc-300 mb-3.5 leading-relaxed">
          {brief?.greeting || "Good morning. Here is your daily student OS brief for RIT campus."}
        </p>

        {/* Cinematic 3D Tour Button */}
        <button
          onClick={handlePlayTour}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition active:scale-[0.98]"
        >
          <PlayCircle size={16} weight="fill" />
          <span>Play Solar Dawn 3D Fly-Through</span>
        </button>

        {/* Key Signals Grid */}
        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center gap-1.5 font-medium text-zinc-200 mb-1.5">
              <CalendarCheck size={14} className="text-cyan-400" />
              <span>Today's Classes & Athletics</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-zinc-300">
              {brief?.scheduleHighlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">-</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center gap-1.5 font-medium text-zinc-200 mb-1.5">
              <Envelope size={14} className="text-amber-400" />
              <span>Priority Mail Signals (Zero Deletions)</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-zinc-300">
              {brief?.actionableEmails.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-zinc-600 font-mono">-</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shared Brain Sovereign Profile Status */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between text-xs shadow-glass-sm">
        <div>
          <div className="font-medium text-zinc-200 flex items-center gap-1.5">
            <CheckCircle size={15} weight="fill" className="text-emerald-400" />
            <span>Shared Brain Active</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
            {brain.student.name} • {brain.student.degree}
          </div>
        </div>
        <button
          onClick={onOpenBrainInspector}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-white/10 transition active:scale-[0.98]"
        >
          Inspect Brain
        </button>
      </div>
    </div>
  );
}
