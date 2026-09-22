"use client";

import React, { useState } from "react";
import { SpecialistId, SharedBrainProfile, MorningBriefData, ChatMessage } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { RoomTabs, RoomId } from "./RoomTabs";
import { AgentChatStream } from "./AgentChatStream";
import { CoreBriefWidget } from "./widgets/CoreBriefWidget";
import { HealthMacroRings } from "./widgets/HealthMacroRings";
import { MoveWorkoutMatrix } from "./widgets/MoveWorkoutMatrix";
import { ScheduleTimeline } from "./widgets/ScheduleTimeline";
import { StudyFlashcards } from "./widgets/StudyFlashcards";
import { WalletBudgetMeter } from "./widgets/WalletBudgetMeter";
import { CareerPipelineBoard } from "./widgets/CareerPipelineBoard";
import { TavilySearchWidget } from "./widgets/TavilySearchWidget";
import { ArrowLeft, SpeakerHigh, SpeakerSlash, Key, Sparkle, ShieldCheck, Lightning } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface CockpitHUDProps {
  specialistId: SpecialistId;
  brain: SharedBrainProfile;
  brief: MorningBriefData | null;
  onClose: () => void;
  onUpdateBrain: (updated: SharedBrainProfile) => void;
  onPlayMorningTour: () => void;
  onOpenBrainInspector: () => void;
  onTriggerApiKeyModal: () => void;
  onActiveTargetsChange?: (targets: SpecialistId[]) => void;
  apiKey?: string;
  mockMode?: boolean;
  onToggleMockMode?: () => void;
}

export function CockpitHUD({
  specialistId,
  brain,
  brief,
  onClose,
  onUpdateBrain,
  onPlayMorningTour,
  onOpenBrainInspector,
  onTriggerApiKeyModal,
  onActiveTargetsChange,
  apiKey,
  mockMode = false,
  onToggleMockMode,
}: CockpitHUDProps) {
  const [activeRoom, setActiveRoom] = useState<RoomId>("general");
  const [isMuted, setIsMuted] = useState(cosmicAudio.getMuted());
  const [isLoading, setIsLoading] = useState(false);

  const spec = SPECIALISTS[specialistId] || SPECIALISTS.core;

  // Initial greeting messages per specialist
  const initialMessages: Record<SpecialistId, ChatMessage[]> = {
    core: [
      {
        id: "core-init",
        sender: "core",
        senderName: "Orbit Core",
        content: `Orbit Core active. All 9 domain specialists are synchronized through your Sovereign Shared Brain. Ask me anything across your domains or try: "Best time to fly home and not fall behind or overspend".`,
        timestamp: "Online",
      },
    ],
    health: [
      {
        id: "health-init",
        sender: "health",
        senderName: "Orbit Health",
        content: `Orbit Health ready. Your bulk target is 3,100 kcal with 170g protein. Meals are logged with honest ranges rather than false precision.`,
        timestamp: "Online",
      },
    ],
    move: [
      {
        id: "move-init",
        sender: "move",
        senderName: "Orbit Move",
        content: `Orbit Move online. Your 4x/week lifting split and Men's Volleyball practices are tracked. Heavy legs remain off game day.`,
        timestamp: "Online",
      },
    ],
    schedule: [
      {
        id: "schedule-init",
        sender: "schedule",
        senderName: "Orbit Schedule",
        content: `Orbit Schedule connected to RIT academic calendar. Any external create or delete strictly requires your authorization.`,
        timestamp: "Online",
      },
    ],
    study: [
      {
        id: "study-init",
        sender: "study",
        senderName: "Orbit Study",
        content: `Orbit Study ready. Slide synthesis and spaced flashcard review powered by NVIDIA Nemotron reasoning.`,
        timestamp: "Online",
      },
    ],
    wallet: [
      {
        id: "wallet-init",
        sender: "wallet",
        senderName: "Orbit Wallet",
        content: `Orbit Wallet active. Monitoring your $800/month spending limit. Soft budget context checked before travel proposals.`,
        timestamp: "Online",
      },
    ],
    deals: [
      {
        id: "deals-init",
        sender: "deals",
        senderName: "Orbit Deals",
        content: `Orbit Deals ready. On-demand .edu discounts and tech hardware hunts via Tavily live web scanning.`,
        timestamp: "Online",
      },
    ],
    explore: [
      {
        id: "explore-init",
        sender: "explore",
        senderName: "Orbit Explore",
        content: `Orbit Explore online. Scanning Rochester local tech meetups and RIT campus weekend events.`,
        timestamp: "Online",
      },
    ],
    travel: [
      {
        id: "travel-init",
        sender: "travel",
        senderName: "Orbit Travel",
        content: `Orbit Travel ready. Monitoring ROC to Boston flight fares with 3-week break look-ahead. Zero auto-bookings.`,
        timestamp: "Online",
      },
    ],
    career: [
      {
        id: "career-init",
        sender: "career",
        senderName: "Orbit Career",
        content: `Orbit Career active. Tracking Summer 2027 SWE/ML internship opportunities for your RIT BS AI '28 resume.`,
        timestamp: "Online",
      },
    ],
    build: [
      {
        id: "build-init",
        sender: "build",
        senderName: "Orbit Build",
        content: `Orbit Build online. Ready to scope portfolio projects, write architecture specs, and scaffold starter code.`,
        timestamp: "Online",
      },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages[specialistId] || initialMessages.core
  );

  const toggleAudio = () => {
    const nextMuted = cosmicAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      senderName: "You",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          specialistId,
          brain,
          apiKey,
          mockMode,
        }),
      });

      const data = await res.json();

      if (res.status === 401 && data.error === "NEBIUS_API_KEY_REQUIRED") {
        onTriggerApiKeyModal();
        setIsLoading(false);
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        cosmicAudio.playChime();

        // If cross-domain routing was detected, activate constellation beams
        if (data.message.routingTrace?.targetSpecialists && onActiveTargetsChange) {
          onActiveTargetsChange(data.message.routingTrace.targetSpecialists);
          setTimeout(() => {
            onActiveTargetsChange([]);
          }, 4500);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizeAction = (id: string) => {
    // Mark approval in brain
    const updated = {
      ...brain,
      pendingApprovals: brain.pendingApprovals.map((a) =>
        a.id === id ? { ...a, status: "approved" as const } : a
      ),
    };
    onUpdateBrain(updated);
  };

  const handleRejectAction = (id: string) => {
    const updated = {
      ...brain,
      pendingApprovals: brain.pendingApprovals.map((a) =>
        a.id === id ? { ...a, status: "rejected" as const } : a
      ),
    };
    onUpdateBrain(updated);
  };

  const renderDomainWidget = () => {
    switch (specialistId) {
      case "core":
        return (
          <CoreBriefWidget
            brain={brain}
            brief={brief}
            onPlayMorningTour={onPlayMorningTour}
            onOpenBrainInspector={onOpenBrainInspector}
          />
        );
      case "health":
        return <HealthMacroRings brain={brain} onUpdateBrain={onUpdateBrain} />;
      case "move":
        return <MoveWorkoutMatrix brain={brain} onUpdateBrain={onUpdateBrain} />;
      case "schedule":
        return (
          <ScheduleTimeline
            brain={brain}
            onRequestHold={() =>
              handleSendMessage("Hold study block tonight for CSCI 320 distributed systems exam")
            }
          />
        );
      case "study":
        return (
          <StudyFlashcards
            brain={brain}
            onGenerateDeck={() =>
              handleSendMessage("Generate a 3-question quiz on residual skip connections and receptive fields")
            }
          />
        );
      case "wallet":
        return <WalletBudgetMeter brain={brain} onUpdateBrain={onUpdateBrain} />;
      case "career":
      case "build":
        return <CareerPipelineBoard brain={brain} />;
      case "deals":
        return (
          <TavilySearchWidget
            defaultQuery="best student tech discounts edu deals 2026"
            domainTitle="Orbit Deals: Student Hardware & Software"
            domainCategory="deals"
          />
        );
      case "travel":
        return (
          <TavilySearchWidget
            defaultQuery="flights ROC to BOS weekend break student deals"
            domainTitle="Orbit Travel: Rochester to Boston Break Logistics"
            domainCategory="travel"
          />
        );
      case "explore":
        return (
          <TavilySearchWidget
            defaultQuery="Rochester NY tech meetups AI hackathons RIT campus events"
            domainTitle="Orbit Explore: Campus & Local Rochester Events"
            domainCategory="explore"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col p-4 md:p-6 bg-slate-950/75 backdrop-blur-xl pointer-events-auto transition-all">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              cosmicAudio.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-gray-200 hover:text-white border border-white/10 text-xs font-display transition active:scale-[0.98]"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Return to Orbit</span>
          </button>

          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shadow-sm animate-pulse"
              style={{ backgroundColor: spec.color }}
            />
            <h2 className="text-base md:text-lg font-display font-semibold text-white tracking-wide">
              {spec.name}
            </h2>
            <span className="hidden sm:inline-block text-xs font-mono text-gray-400">
              • {spec.domain}
            </span>
          </div>
        </div>

        {/* Action Controls and Telemetry */}
        <div className="flex items-center gap-2">
          {/* Model Inference Badge / Mock Mode Toggle */}
          <button
            onClick={onToggleMockMode}
            title={mockMode ? "Mock AI Active (Zero Credits Spent) • Click to toggle Live Nebius" : "Live Nebius Active • Click to switch to Mock AI"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition active:scale-[0.98] ${
              mockMode
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/70 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "bg-slate-900/90 border-amber-400/20 text-amber-300 hover:bg-slate-800"
            }`}
          >
            {mockMode ? (
              <>
                <Lightning size={12} weight="fill" className="text-emerald-400 animate-pulse" />
                <span>Simulated Nemotron (0 Credits)</span>
              </>
            ) : (
              <>
                <Sparkle size={12} weight="fill" className="text-amber-400" />
                <span>NVIDIA Nemotron via Nebius</span>
              </>
            )}
          </button>

          {/* Key Settings Button */}
          <button
            onClick={() => {
              cosmicAudio.playClick();
              onTriggerApiKeyModal();
            }}
            title="Configure Nebius & Tavily API Keys"
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-gray-300 hover:text-white border border-white/10 transition active:scale-[0.98]"
          >
            <Key size={15} weight="duotone" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleAudio}
            title={isMuted ? "Unmute Cosmic Audio" : "Mute Cosmic Audio"}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-gray-300 hover:text-white border border-white/10 transition active:scale-[0.98]"
          >
            {isMuted ? (
              <SpeakerSlash size={15} weight="duotone" className="text-gray-400" />
            ) : (
              <SpeakerHigh size={15} weight="duotone" className="text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Two-Column Cockpit Interior */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">
        {/* Left/Center Column: Conversational Routing Stream */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
          {specialistId === "core" && (
            <RoomTabs activeRoom={activeRoom} onSelectRoom={setActiveRoom} />
          )}
          <div className="flex-1 min-h-0">
            <AgentChatStream
              messages={messages}
              onSendMessage={handleSendMessage}
              onAuthorizeAction={handleAuthorizeAction}
              onRejectAction={handleRejectAction}
              isLoading={isLoading}
              activeSpecialistId={specialistId}
            />
          </div>
        </div>

        {/* Right Column: Contextual Specialist Domain Tools */}
        <div className="lg:col-span-5 h-full overflow-y-auto pr-1">
          {renderDomainWidget()}
        </div>
      </div>
    </div>
  );
}
