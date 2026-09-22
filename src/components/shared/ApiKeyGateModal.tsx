"use client";

import React, { useState } from "react";
import { Key, ShieldCheck, X, Sparkle, GlobeHemisphereWest, Lightning } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface ApiKeyGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (nebiusKey: string, tavilyKey: string) => void;
  currentNebiusKey: string;
  currentTavilyKey: string;
  mockMode?: boolean;
  onToggleMockMode?: () => void;
}

export function ApiKeyGateModal({
  isOpen,
  onClose,
  onSaveKeys,
  currentNebiusKey,
  currentTavilyKey,
  mockMode = false,
  onToggleMockMode,
}: ApiKeyGateModalProps) {
  const [nebiusKey, setNebiusKey] = useState(currentNebiusKey);
  const [tavilyKey, setTavilyKey] = useState(currentTavilyKey);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    cosmicAudio.playChime();
    onSaveKeys(nebiusKey.trim(), tavilyKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="w-full max-w-md p-6 rounded-2xl bg-space-900/95 border border-amber-400/30 shadow-solar-glow text-white relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-400/20">
              <Key size={17} weight="duotone" />
            </span>
            <h3 className="text-sm font-display font-semibold text-amber-200">
              Inference & Search Credentials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Inference Mode Toggle Card */}
        <div className="mb-4 p-3 rounded-xl bg-space-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-semibold text-gray-200">
              Testing Mode
            </span>
            {onToggleMockMode && (
              <button
                type="button"
                onClick={onToggleMockMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition border ${
                  mockMode
                    ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                }`}
              >
                <Lightning size={11} weight="fill" className={mockMode ? "text-emerald-400 animate-pulse" : "text-amber-400"} />
                <span>{mockMode ? "Mock AI (0 Credits)" : "Live Nebius"}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {mockMode
              ? "⚡ Mock Mode Active: Perfect for client-side frontend development. All chat streams, quick prompts, and action approvals run locally with zero credit consumption."
              : "✨ Live Cloud Mode: Live inference calls to NVIDIA Nemotron-70B on Nebius Token Factory."}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[11px] text-amber-300 flex items-center gap-1">
                <Sparkle size={12} weight="fill" />
                <span>Nebius Token Factory API Key</span>
              </label>
              <a
                href="https://tokenfactory.nebius.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400/80 hover:text-amber-300 underline font-mono"
              >
                Get Token
              </a>
            </div>
            <input
              type="password"
              value={nebiusKey}
              onChange={(e) => setNebiusKey(e.target.value)}
              placeholder="eyJhbGciOi... or neb-token"
              className="w-full px-3 py-2 rounded-xl bg-space-950 border border-white/10 text-white placeholder:text-gray-600 font-mono text-[11px] focus:outline-none focus:border-amber-400 transition"
            />
            <span className="text-[10px] font-mono text-gray-400 mt-1 block">
              Powers NVIDIA Nemotron-70B model orchestration on high performance GPUs.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[11px] text-cyan-300 flex items-center gap-1">
                <GlobeHemisphereWest size={12} weight="duotone" />
                <span>Tavily Search API Key (Optional)</span>
              </label>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-400/80 hover:text-cyan-300 underline font-mono"
              >
                Get Key
              </a>
            </div>
            <input
              type="password"
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              placeholder="tvly-..."
              className="w-full px-3 py-2 rounded-xl bg-space-950 border border-white/10 text-white placeholder:text-gray-600 font-mono text-[11px] focus:outline-none focus:border-cyan-400 transition"
            />
            <span className="text-[10px] font-mono text-gray-400 mt-1 block">
              Enables real-time student flight searches, .edu deals, and campus events ($3,000 sponsor award).
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
            <ShieldCheck size={16} weight="bold" className="shrink-0 text-emerald-400" />
            <span>Sovereign Storage: Keys are held only in your active browser session and never shared.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-gray-400 hover:text-white transition font-display"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-semibold text-xs transition active:scale-[0.98]"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
