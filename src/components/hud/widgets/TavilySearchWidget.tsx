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
      const res = await fetch("/api/tavily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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

  const getAccentColor = () => {
    switch (domainCategory) {
      case "deals":
        return "text-teal-300 border-teal-500/20";
      case "travel":
        return "text-sky-300 border-sky-500/20";
      case "explore":
        return "text-purple-300 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-xl bg-space-900/80 border backdrop-blur-md shadow-glass-sm ${getAccentColor()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GlobeHemisphereWest size={18} weight="duotone" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              {domainTitle}
            </h4>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
            <Sparkle size={11} weight="fill" className="text-amber-400" />
            Tavily Live Web Engine
          </span>
        </div>

        <p className="text-xs text-gray-300 mb-3">
          Real-time external intelligence gathered with Tavily Search API. Zero auto-purchases or unauthorized mutations.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verified student deals, flights, or local meetups..."
            className="flex-1 px-3 py-2 rounded-lg bg-space-950/80 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-display font-medium text-xs transition active:scale-[0.98] flex items-center gap-1.5 shrink-0"
          >
            <MagnifyingGlass size={14} weight="bold" />
            <span>{loading ? "Searching..." : "Scan Web"}</span>
          </button>
        </form>

        {/* Answer Synthesis */}
        {answer && (
          <div className="p-2.5 rounded-lg bg-space-950/60 border border-white/5 text-xs text-gray-200 mb-3">
            <span className="font-mono text-[10px] text-cyan-400 block mb-1">Tavily Digest:</span>
            {answer}
          </div>
        )}

        {/* Results List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {results.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-lg bg-space-950/50 border border-white/5 hover:border-cyan-400/30 transition text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-medium text-white group-hover:text-cyan-300 transition line-clamp-1">
                  {res.title}
                </span>
                <ArrowSquareOut size={13} className="text-gray-400 group-hover:text-white shrink-0 ml-1" />
              </div>
              <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                {res.snippet}
              </p>
            </a>
          ))}
          {!loading && results.length === 0 && (
            <div className="text-center py-4 text-xs font-mono text-gray-500">
              Click "Scan Web" to run live Tavily student search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
