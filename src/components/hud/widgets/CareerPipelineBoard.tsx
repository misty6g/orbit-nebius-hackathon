"use client";

import React, { useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Briefcase, FileCode, CheckCircle, Sparkle, ArrowUpRight } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface CareerPipelineBoardProps {
  brain: SharedBrainProfile;
  onGenerateProjectSpec?: () => void;
}

export function CareerPipelineBoard({
  brain,
  onGenerateProjectSpec,
}: CareerPipelineBoardProps) {
  const pipeline = brain.activity.careerPipeline || [];
  const [selectedRole, setSelectedRole] = useState(pipeline[0] || null);
  const [generatedSpec, setGeneratedSpec] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const season = brain.goals.career.targetSeason?.trim() || "your recruiting season";
  const roles =
    brain.goals.career.targetRoles?.filter(Boolean).slice(0, 2).join(" / ") ||
    "your target roles";
  const resumeLabel = [brain.student.degree, brain.student.gradYear]
    .filter(Boolean)
    .join(" · ") || "Shared Brain resume";

  const handleTriggerBuild = () => {
    cosmicAudio.playClick();
    setIsGenerating(true);
    const targetRole = selectedRole?.role || roles;
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSpec(
        `# Scoped Proof-of-Work Project Spec
**Target Role:** ${targetRole} (${season})

### Architecture Highlights:
- Clear problem statement tied to the job description
- Modular services with documented interfaces
- Evaluation harness with reproducible metrics
- README with setup, demo script, and trade-offs

### Starter Files Staged:
1. \`README.md\` (recruiter walk-through)
2. \`docs/architecture.md\`
3. \`src/\` scaffold
4. \`benchmarks/\` evaluation notes`
      );
      cosmicAudio.playChime();
    }, 1200);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Pipeline Header */}
      <div className="p-4 rounded-xl bg-space-950/60 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Briefcase size={16} weight="duotone" className="text-amber-400" />
            <h4 className="text-xs font-mono font-medium tracking-wide text-slate-200">
              {season} Pipeline
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
            {resumeLabel}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Focus: {roles}. Orbit Career monitors targets, tailors 1-page resumes, and passes job
          specs to Orbit Build for portfolio proof-of-work.
        </p>

        {/* Pipeline Cards */}
        <div className="space-y-1.5">
          {pipeline.length === 0 ? (
            <p className="text-[11px] font-mono text-slate-500 px-1 py-2">
              No pipeline entries yet. Ask Orbit Career to scout roles or add companies in chat.
            </p>
          ) : null}
          {pipeline.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                cosmicAudio.playClick();
                setSelectedRole(item);
              }}
              className={`p-3 rounded-lg border transition cursor-pointer text-xs ${
                selectedRole?.id === item.id
                  ? "bg-white/[0.06] border-white/20 shadow-sm"
                  : "bg-space-900/40 border border-white/[0.05] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-200">{item.company}</span>
                <span className="font-mono text-amber-300 font-semibold">{item.matchScore}% Match</span>
              </div>
              <div className="text-[11px] text-slate-400 mb-1">{item.role}</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="capitalize text-slate-400">
                  Status: {(item.stage || "scouted").replace("-", " ")}
                </span>
                <span>{season}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Orbit Build Action */}
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={handleTriggerBuild}
            disabled={isGenerating}
            className="zen-btn w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs transition active:scale-[0.98] disabled:opacity-50"
          >
            <FileCode size={15} weight="bold" />
            <span>{isGenerating ? "Synthesizing Project Architecture..." : "Orbit Build: Generate Proof-of-Work Project"}</span>
          </button>
        </div>
      </div>

      {/* Generated Project Spec Drawer */}
      {generatedSpec && (
        <div className="p-4 rounded-xl bg-space-950/95 border border-white/[0.12] backdrop-blur-md shadow-glass-md text-xs">
          <div className="flex items-center justify-between mb-2 text-slate-200 font-mono font-medium">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sparkle size={13} weight="fill" />
              Orbit Build Output
            </span>
            <button
              onClick={() => setGeneratedSpec(null)}
              className="text-slate-400 hover:text-white text-[11px] transition"
            >
              Dismiss
            </button>
          </div>
          <div className="font-mono text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed bg-space-900/60 p-3 rounded-lg border border-white/[0.05] max-h-48 overflow-y-auto">
            {generatedSpec}
          </div>
        </div>
      )}
    </div>
  );
}
