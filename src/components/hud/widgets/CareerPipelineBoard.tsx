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

  const handleTriggerBuild = () => {
    cosmicAudio.playClick();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSpec(
        `# Scoped Proof-of-Work Project: Distributed KV Store with GPU-Accelerated Embeddings
**Target Role:** NVIDIA Deep Learning Systems Intern (Summer 2027)

### Architecture Highlights:
- C++20 core engine with zero-copy shared memory buffer
- CUDA kernel integration for high-throughput batch vector cosine similarity
- Redis protocol compatibility (RESP3 parser)
- Benchmark suite targeting < 250 microsecond p99 latency

### Starter Files Staged:
1. \`include/orbit_tensor_kv.hpp\`
2. \`src/kernels/vector_similarity.cu\`
3. \`benchmarks/throughput_eval.py\`
4. \`README.md\` (Recruiter walk-through and reproducible Docker environment)`
      );
      cosmicAudio.playChime();
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Header */}
      <div className="p-4 rounded-xl bg-space-900/80 border border-indigo-500/20 backdrop-blur-md shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Briefcase size={18} weight="duotone" className="text-indigo-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300">
              Summer 2027 SWE and ML Pipeline
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            RIT BS AI '28 Resume
          </span>
        </div>

        <p className="text-xs text-gray-300 mb-3">
          Orbit Career monitors target companies, tailors 1-page resumes, and passes job specs to Orbit Build for portfolio proof-of-work.
        </p>

        {/* Pipeline Cards */}
        <div className="space-y-2">
          {pipeline.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                cosmicAudio.playClick();
                setSelectedRole(item);
              }}
              className={`p-3 rounded-lg border transition cursor-pointer text-xs ${
                selectedRole?.id === item.id
                  ? "bg-indigo-950/40 border-indigo-400/50 shadow-sm"
                  : "bg-space-950/60 border-white/5 hover:border-indigo-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-medium text-white">{item.company}</span>
                <span className="font-mono text-indigo-300 font-semibold">{item.matchScore}% Match</span>
              </div>
              <div className="text-[11px] text-gray-300 mb-1">{item.role}</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span className="capitalize text-indigo-400">Status: {item.stage.replace("-", " ")}</span>
                <span>Summer 2027</span>
              </div>
            </div>
          ))}
        </div>

        {/* Orbit Build Action */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <button
            onClick={handleTriggerBuild}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-display font-medium text-xs transition active:scale-[0.98]"
          >
            <FileCode size={16} weight="bold" />
            <span>{isGenerating ? "Synthesizing Project Architecture..." : "Orbit Build: Generate Proof-of-Work Project"}</span>
          </button>
        </div>
      </div>

      {/* Generated Project Spec Drawer */}
      {generatedSpec && (
        <div className="p-4 rounded-xl bg-space-900/90 border border-indigo-400/30 backdrop-blur-md shadow-glass-md text-xs">
          <div className="flex items-center justify-between mb-2 text-indigo-300 font-mono font-semibold">
            <span className="flex items-center gap-1">
              <Sparkle size={14} weight="fill" />
              Orbit Build Output
            </span>
            <button
              onClick={() => setGeneratedSpec(null)}
              className="text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="font-mono text-gray-200 text-[11px] whitespace-pre-wrap leading-relaxed bg-space-950/80 p-3 rounded border border-white/5 max-h-48 overflow-y-auto">
            {generatedSpec}
          </div>
        </div>
      )}
    </div>
  );
}
