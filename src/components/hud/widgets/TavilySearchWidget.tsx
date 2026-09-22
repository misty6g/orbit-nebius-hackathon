"use client";

import React, { useState } from "react";
import { MagnifyingGlass, GlobeHemisphereWest, ArrowSquareOut, Sparkle } from "@phosphor-icons/react";
import { TavilySearchResult } from "@/lib/tavily";
import { cosmicAudio } from "@/lib/audio";

interface TavilySearchWidgetProps {
  defaultQuery: string;
  domainTitle: string;
  domainCategory: "deals" | "travel" | "explore";
}

export function TavilySearchWidget({
  defaultQuery,
  domainTitle,
  domainCategory,
}: TavilySearchWidgetProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<TavilySearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    cosmicAudio.playClick();
    setLoading(true);
    try {
      const clientKey = typeof window !== "undefined" ? localStorage.getItem("orbit_tavily_key") || undefined : undefined;
      const res = await fetch("/api/tavily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, apiKey: clientKey }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setAnswer(data.answer || null);
      if (data.results?.length > 0) {
        cosmicAudio.playChime();
      }
    } catch (err) {
      console.error("Tavily search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="p-4 rounded-xl bg-space-950/60 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GlobeHemisphereWest size={16} weight="duotone" className="text-amber-400" />
            <h4 className="text-xs font-mono font-medium tracking-wide text-slate-200">
              {domainTitle}
            </h4>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Sparkle size={11} weight="fill" className="text-amber-400" />
            Tavily Live Web Engine
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Real-time external intelligence gathered with Tavily Search API. Zero auto-purchases or unauthorized mutations.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verified student deals, flights, or local meetups..."
            className="flex-1 px-3 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="zen-btn px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs transition active:scale-[0.98] flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <MagnifyingGlass size={13} weight="bold" />
            <span>{loading ? "Searching..." : "Scan Web"}</span>
          </button>
        </form>

        {/* Answer Synthesis */}
        {answer && (
          <div className="p-3 rounded-lg bg-space-900/60 border border-white/[0.06] text-xs text-slate-300 mb-3 leading-relaxed">
            <span className="font-mono text-[10px] text-amber-300 block mb-1">Tavily Digest:</span>
            {answer}
          </div>
        )}

        {/* Results List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {results.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-space-900/40 border border-white/[0.05] hover:border-white/[0.12] transition text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-200 group-hover:text-amber-300 transition line-clamp-1">
                  {res.title}
                </span>
                <ArrowSquareOut size={13} className="text-slate-500 group-hover:text-white shrink-0 ml-1.5 transition" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {res.snippet}
              </p>
            </a>
          ))}
          {!loading && results.length === 0 && (
            <div className="text-center py-4 text-xs font-mono text-slate-500">
              Click "Scan Web" to run live Tavily student search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
