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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#090b0e] border border-white/[0.1] shadow-zen-dock text-slate-100 relative font-sans">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Key size={16} weight="duotone" />
            </span>
            <h3 className="text-sm font-semibold text-slate-100">
              Inference & Search Credentials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Inference Mode Toggle Card */}
        <div className="mb-4 p-3 rounded-xl bg-space-900/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-200">
              Testing Mode
            </span>
            {onToggleMockMode && (
              <button
                type="button"
                onClick={onToggleMockMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition border ${
                  mockMode
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-400/10 border-amber-400/30 text-amber-300"
                }`}
              >
                <Lightning size={11} weight="fill" className={mockMode ? "text-emerald-400 animate-pulse" : "text-amber-400"} />
                <span>{mockMode ? "Mock AI (0 Credits)" : "Live Nebius"}</span>
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {mockMode
              ? "Mock Mode Active: Local synthetic generation for fluid UI testing with zero API credit consumption."
              : "Live Cloud Mode: Live inference calls to NVIDIA Nemotron-70B on Nebius Token Factory."}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                <Sparkle size={12} weight="fill" className="text-amber-400" />
                <span>Nebius Token Factory API Key</span>
              </label>
              <a
                href="https://tokenfactory.nebius.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono"
              >
                Get Token
              </a>
            </div>
            <input
              type="password"
              value={nebiusKey}
              onChange={(e) => setNebiusKey(e.target.value)}
              placeholder="eyJhbGciOi... or neb-token"
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-white/10 text-white placeholder:text-slate-600 font-mono text-[11px] focus:outline-none focus:border-amber-400/50 transition"
            />
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Powers NVIDIA Nemotron-70B model orchestration on high performance GPUs.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                <GlobeHemisphereWest size={12} weight="duotone" className="text-amber-400" />
                <span>Tavily Search API Key (Optional)</span>
              </label>
              <a
                href="https://tavily.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono"
              >
                Get Key
              </a>
            </div>
            <input
              type="password"
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              placeholder="tvly-..."
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-white/10 text-white placeholder:text-slate-600 font-mono text-[11px] focus:outline-none focus:border-amber-400/50 transition"
            />
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Enables real-time student flight searches, verified student deals, and campus events.
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
            <ShieldCheck size={16} weight="bold" className="shrink-0 text-emerald-400" />
            <span>Sovereign Storage: Keys are held only in your active browser session and never shared.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="zen-btn px-3 py-2 rounded-lg text-slate-400 hover:text-white transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="zen-btn px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs transition active:scale-[0.98]"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
