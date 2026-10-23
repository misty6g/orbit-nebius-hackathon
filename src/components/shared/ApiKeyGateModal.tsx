"use client";

import React, { useEffect, useState } from "react";
import { Key, ShieldCheck, X, Sparkle, GlobeHemisphereWest } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface ApiKeyGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (nebiusKey: string, tavilyKey: string) => void;
  currentNebiusKey: string;
  currentTavilyKey: string;
  /** When true, closing without a Nebius key (client or server) is discouraged. */
  requireNebius?: boolean;
  serverHasNebius?: boolean;
  serverHasTavily?: boolean;
}

export function ApiKeyGateModal({
  isOpen,
  onClose,
  onSaveKeys,
  currentNebiusKey,
  currentTavilyKey,
  requireNebius = false,
  serverHasNebius = false,
  serverHasTavily = false,
}: ApiKeyGateModalProps) {
  const [nebiusKey, setNebiusKey] = useState(currentNebiusKey);
  const [tavilyKey, setTavilyKey] = useState(currentTavilyKey);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNebiusKey(currentNebiusKey);
    setTavilyKey(currentTavilyKey);
    setError(null);
  }, [isOpen, currentNebiusKey, currentTavilyKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const nextNebius = nebiusKey.trim();
    const nextTavily = tavilyKey.trim();
    if (requireNebius && !nextNebius && !serverHasNebius) {
      setError("Paste a Nebius Token Factory API key to run live Nemotron inference.");
      return;
    }
    try {
      cosmicAudio.playChime();
    } catch {
      /* ignore */
    }
    onSaveKeys(nextNebius, nextTavily);
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
              API Credentials
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            aria-label="Close credentials"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Enter your Nebius Token Factory and Tavily keys here. Orbit stores them only in this
            browser (localStorage) and sends them with chat/search requests — no{" "}
            <span className="font-mono text-slate-300">.env</span> edit required for the happy path.
            {serverHasNebius && (
              <span className="block mt-1.5 text-emerald-400/90">
                This host already has a server Nebius key; pasting yours overrides it for this browser.
              </span>
            )}
          </p>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                <Sparkle size={12} weight="fill" className="text-amber-400" />
                <span>
                  Nebius Token Factory API Key
                  {!serverHasNebius && (
                    <span className="text-amber-400/80"> (required)</span>
                  )}
                </span>
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
              onChange={(e) => {
                setNebiusKey(e.target.value);
                setError(null);
              }}
              placeholder="eyJhbGciOi... or neb-token"
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-white/10 text-white placeholder:text-slate-600 font-mono text-[11px] focus:outline-none focus:border-amber-400/50 transition"
            />
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Powers live NVIDIA Nemotron Nano / Super / Ultra on Token Factory.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                <GlobeHemisphereWest size={12} weight="duotone" className="text-amber-400" />
                <span>
                  Tavily Search API Key
                  {serverHasTavily ? " (host default active)" : " (recommended)"}
                </span>
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
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg bg-space-950 border border-white/10 text-white placeholder:text-slate-600 font-mono text-[11px] focus:outline-none focus:border-amber-400/50 transition"
            />
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Enables live Deals, Travel, and Explore web results with source pills.
            </span>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200">
              {error}
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
            <ShieldCheck size={16} weight="bold" className="shrink-0 text-emerald-400" />
            <span>
              Sovereign storage: keys stay in this browser session and are never written to Orbit
              servers as durable secrets.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="zen-btn px-3 py-2 rounded-lg text-slate-400 hover:text-white transition text-xs"
            >
              {serverHasNebius || currentNebiusKey ? "Close" : "Later"}
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
