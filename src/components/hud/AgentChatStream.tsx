"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, SharedBrainProfile, SpecialistId } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { PaperPlaneRight, Cpu, Sparkle, CaretDown, CaretUp, ArrowSquareOut } from "@phosphor-icons/react";
import { InStreamAuthCard } from "./InStreamAuthCard";
import { cosmicAudio } from "@/lib/audio";

interface AgentChatStreamProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onAuthorizeAction: (id: string) => void;
  onRejectAction: (id: string) => void;
  isLoading: boolean;
  activeSpecialistId: SpecialistId;
  brain: SharedBrainProfile;
}

function buildQuickPrompts(brain: SharedBrainProfile): Record<SpecialistId, string[]> {
  const calories = brain.goals.nutrition.caloriesTarget || 2500;
  const budget = brain.goals.wallet.monthlyBudgetCap || 600;
  const airport = brain.student.homeAirport?.trim().toUpperCase() || "home";
  const campus = brain.student.campus?.trim() || "campus";
  const sports =
    brain.goals.workout.sports?.filter(Boolean)[0] || "game day";
  const season = brain.goals.career.targetSeason?.trim() || "this recruiting season";
  const role =
    brain.goals.career.targetRoles?.filter(Boolean)[0] || "my target internship";

  return {
    core: [
      "Best time to fly home and not fall behind or overspend",
      "What is my morning brief today?",
      "Coordinate a study hold tonight",
      `Check my ${season} internship pipeline`,
    ],
    health: [
      "Log a high-protein lunch with honest calorie ranges",
      `How are my macros pacing against the ${calories.toLocaleString()} kcal target?`,
      "Suggest a high-protein snack after training",
    ],
    move: [
      "When did I last train legs?",
      "Log today's main lifts and sets",
      `Check recovery readiness for ${sports}`,
    ],
    schedule: [
      "What classes and commitments do I have today?",
      "Find 2 hours of free study time tonight",
      "Hold a study block this evening",
    ],
    study: [
      "Explain a tough concept from my last lecture",
      "Generate a 3-question quiz on my weak topics",
      "Review flashcards that need spaced practice",
    ],
    wallet: [
      "Log a campus dining purchase",
      `How much budget is left in my $${budget.toLocaleString()} monthly cap?`,
      "Can I afford a break flight this month?",
    ],
    explore: [
      `Find local tech meetups near ${campus} this week`,
      `What student events are happening near ${campus}?`,
    ],
    deals: [
      "Find student discounts for laptops and AI hardware",
      "Any active .edu deals on cloud compute credits?",
    ],
    travel: [
      `Find break flights involving ${airport} with student pricing`,
      "What is the look-ahead for the next university break?",
    ],
    career: [
      `Tailor my resume for ${role}`,
      `Find openings for ${season}`,
    ],
    build: [
      "Generate a portfolio project spec from a job description",
      "Draft README and architecture for my next project",
    ],
  };
}

export function AgentChatStream({
  messages,
  onSendMessage,
  onAuthorizeAction,
  onRejectAction,
  isLoading,
  activeSpecialistId,
  brain,
}: AgentChatStreamProps) {
  const [input, setInput] = useState("");
  const [openTraceId, setOpenTraceId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    cosmicAudio.playClick();
    onSendMessage(input.trim());
    setInput("");
  };

  const quickPrompts = buildQuickPrompts(brain);
  const prompts = quickPrompts[activeSpecialistId] || quickPrompts.core;

  return (
    <div className="flex flex-col h-full bg-zinc-950/70 rounded-2xl border border-white/10 overflow-hidden shadow-glass-md">
      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const spec = !isUser ? SPECIALISTS[msg.sender as SpecialistId] || SPECIALISTS.core : null;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-mono text-zinc-400">
                {!isUser && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: spec?.color || "#fbbf24" }}
                  />
                )}
                <span className="font-medium text-zinc-300">
                  {isUser ? "You" : msg.senderName}
                </span>
                <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed transition ${
                  isUser
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-sm border border-white/10 shadow-sm"
                    : "bg-zinc-900/90 text-zinc-200 rounded-tl-sm border border-white/10 shadow-glass-sm"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {/* Connected account search citations */}
                {msg.connectorSources && msg.connectorSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 mb-2">
                      <Sparkle size={12} weight="fill" className="text-cyan-400" />
                      <span>Connected source search:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.connectorSources.map((source, idx) => {
                        const inner = (
                          <>
                            <span className="text-[9px] uppercase text-zinc-500">
                              {source.source}
                            </span>
                            <span className="truncate">{source.title}</span>
                            {source.url && (
                              <ArrowSquareOut
                                size={11}
                                className="shrink-0 text-zinc-500 group-hover/src:text-cyan-300 transition"
                              />
                            )}
                          </>
                        );
                        const className =
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white border border-white/10 hover:border-cyan-400/40 transition truncate max-w-[260px] group/src";
                        return source.url ? (
                          <a
                            key={`${source.source}-${source.id || idx}`}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={className}
                            title={source.snippet || source.title}
                          >
                            {inner}
                          </a>
                        ) : (
                          <span
                            key={`${source.source}-${source.id || idx}`}
                            className={className}
                            title={source.snippet || source.title}
                          >
                            {inner}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Live Web Grounding Source Badges (Tavily Search API) */}
                {msg.tavilySources && msg.tavilySources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 mb-2">
                      <Sparkle size={12} weight="fill" className="text-amber-400" />
                      <span>Live Intelligence via Tavily Search:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.tavilySources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white border border-white/10 hover:border-amber-400/40 transition truncate max-w-[260px] group/src"
                          title={`${source.title}\n${source.snippet}`}
                        >
                          <span className="truncate">{source.title}</span>
                          <ArrowSquareOut size={11} className="shrink-0 text-zinc-500 group-hover/src:text-amber-300 transition" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sovereign Action Authorization Card */}
                {msg.approvalRequest && (
                  <InStreamAuthCard
                    approval={msg.approvalRequest}
                    onAuthorize={onAuthorizeAction}
                    onReject={onRejectAction}
                  />
                )}

                {/* Expandable Orbit Core dual-routing trace */}
                {msg.routingTrace && (
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    <button
                      onClick={() =>
                        setOpenTraceId(openTraceId === msg.id ? null : msg.id)
                      }
                      className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 hover:text-amber-300 transition"
                    >
                      <Cpu size={13} weight="bold" />
                      <span>
                        Orbit Core Route ·{" "}
                        {msg.routingTrace.tier === "ultra"
                          ? "Nemotron 3 Ultra"
                          : msg.routingTrace.tier === "super"
                            ? "Nemotron 3 Super"
                            : msg.routingTrace.tier === "nano"
                              ? "Nemotron 3 Nano"
                              : "Nemotron"}
                      </span>
                      {openTraceId === msg.id ? <CaretUp size={11} /> : <CaretDown size={11} />}
                    </button>

                    {openTraceId === msg.id && (
                      <div className="mt-2 p-2.5 rounded-xl bg-zinc-950/80 border border-white/10 text-[10px] font-mono text-zinc-300 space-y-1">
                        <div>
                          <span className="text-zinc-500">Response Tier: </span>
                          <span className="text-amber-300">
                            {msg.routingTrace.tier === "ultra"
                              ? "Nemotron 3 Ultra"
                              : msg.routingTrace.tier === "super"
                                ? "Nemotron 3 Super"
                                : msg.routingTrace.tier === "nano"
                                  ? "Nemotron 3 Nano"
                                  : "Nemotron"}{" "}
                            ({msg.routingTrace.modelUsed})
                          </span>
                        </div>
                        {msg.routingTrace.tierReason && (
                          <div>
                            <span className="text-zinc-500">Tier Reason: </span>
                            <span>{msg.routingTrace.tierReason}</span>
                          </div>
                        )}
                        {msg.routingTrace.decisionModel && (
                          <div>
                            <span className="text-zinc-500">Decision Model: </span>
                            <span className="text-zinc-200">
                              {msg.routingTrace.decisionModel} via{" "}
                              {msg.routingTrace.routedBy === "nano"
                                ? "Nano classifier"
                                : "heuristic fallback"}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-500">Extracted Intent: </span>
                          <span>"{msg.routingTrace.intent}"</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Active Specialist Planets: </span>
                          <span className="text-zinc-200">
                            {msg.routingTrace.targetSpecialists.join(", ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Model Confidence: </span>
                          <span>{Math.round(msg.routingTrace.confidence * 100)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 p-2">
            <Sparkle size={14} className="animate-spin" />
            <span>Orbit Core is choosing planets and model tier...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-white/5 bg-zinc-950/50 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
          Try:
        </span>
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              cosmicAudio.playClick();
              onSendMessage(p);
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white border border-white/10 whitespace-nowrap transition active:scale-[0.98]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-900/80 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${SPECIALISTS[activeSpecialistId]?.name || "Orbit Core"}...`}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 transition font-sans"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition active:scale-[0.98] flex items-center gap-1.5 shrink-0"
        >
          <PaperPlaneRight size={14} weight="bold" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
