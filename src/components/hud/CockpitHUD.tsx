"use client";

import React, { useState, useEffect } from "react";
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
import {
  ArrowLeft,
  SpeakerHigh,
  SpeakerSlash,
  Key,
  Sparkle,
  Lightning,
  X,
  SlidersHorizontal,
  Pause,
  Play,
} from "@phosphor-icons/react";
import { cosmicAudio, AudioEngineState } from "@/lib/audio";

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
  onOpenCustomizer?: (id: SpecialistId) => void;
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
  onOpenCustomizer,
  apiKey,
  mockMode = false,
  onToggleMockMode,
}: CockpitHUDProps) {
  const [activeRoom, setActiveRoom] = useState<RoomId>("general");
  const [audioState, setAudioState] = useState<AudioEngineState>(cosmicAudio.getState());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return cosmicAudio.subscribe((state) => {
      setAudioState(state);
    });
  }, []);

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cosmicAudio.playClick();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleAudio = () => {
    cosmicAudio.toggleMusic();
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
          history: messages.slice(-6).map((m) => ({ sender: m.sender, content: m.content })),
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
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: specialistId,
            senderName: "Orbit System",
            content: `⚠️ **Notice:** ${data.details || data.message || "Nebius inference returned an error."}\n\n*Tip: You can toggle **Mock AI (0 Credits)** in the top right to test the full system offline.*`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: specialistId,
          senderName: "Orbit System",
          content: `⚠️ **Network Notice:** Could not reach the API endpoint. You can toggle **Mock AI (0 Credits)** in the top right to test without API connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizeAction = (id: string) => {
    const targetMsg = messages.find((m) => m.approvalRequest?.id === id);
    const approval = targetMsg?.approvalRequest;

    let updatedCalendar = [...brain.activity.calendar];
    if (approval && approval.service === "Google Calendar") {
      const isFlight = approval.title.toLowerCase().includes("flight") || approval.title.toLowerCase().includes("travel");
      updatedCalendar.push({
        id: `hold-${Date.now()}`,
        title: isFlight ? "Confirmed Hold: ROC -> BOS Break Travel" : "Confirmed Hold: CSCI 320 Evening Study Block",
        time: isFlight ? "Dec 19 - Jan 3 (Provisional Window)" : "8:30 PM - 10:00 PM Tonight",
        category: isFlight ? "life" : "study",
        isHold: true,
      });
    }

    const updated: SharedBrainProfile = {
      ...brain,
      activity: {
        ...brain.activity,
        calendar: updatedCalendar,
      },
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
    <>
      {/* Ambient Cosmos Backdrop Scrim */}
      <div
        onClick={() => {
          cosmicAudio.playClick();
          onClose();
        }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Main Centered Spacious Cockpit Console */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${spec.name} Cockpit Console`}
        className="fixed inset-3 sm:inset-5 md:inset-8 z-50 max-w-5xl xl:max-w-6xl mx-auto my-auto h-[90vh] max-h-[880px] flex flex-col p-4 sm:p-5 md:p-6 bg-[#07080a]/94 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-zen-dock pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-250"
      >
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                cosmicAudio.playClick();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition active:scale-[0.98]"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Orbit Overview</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] bg-zinc-800 border border-white/10 rounded text-zinc-400">
                ESC
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: spec.color }}
              />
              <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                {spec.name}
              </h2>
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
                / {spec.domain}
              </span>
            </div>
          </div>

          {/* Action Controls and Telemetry */}
          <div className="flex items-center gap-2">
            {/* Model Inference Badge / Mock Mode Toggle */}
            <button
              onClick={onToggleMockMode}
              title={mockMode ? "Mock AI Active (Zero Credits) - Click to toggle Live Nebius" : "Live Nebius Active - Click to switch to Mock AI"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono transition active:scale-[0.98] ${
                mockMode
                  ? "bg-zinc-900/90 border-emerald-500/40 text-emerald-300 hover:bg-zinc-800/90"
                  : "bg-zinc-900/90 border-amber-500/40 text-amber-300 hover:bg-zinc-800/90"
              }`}
            >
              {mockMode ? (
                <>
                  <Lightning size={12} weight="fill" className="text-emerald-400" />
                  <span>Simulated Nemotron (0 Credits)</span>
                </>
              ) : (
                <>
                  <Sparkle size={12} weight="fill" className="text-amber-400" />
                  <span>NVIDIA Nemotron via Nebius</span>
                </>
              )}
            </button>

            {/* Customize Planet Button */}
            {onOpenCustomizer && specialistId !== "core" && (
              <button
                onClick={() => {
                  cosmicAudio.playClick();
                  onOpenCustomizer(specialistId);
                }}
                title={`Customize ${spec.name} Design & Moons`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-amber-400/40 text-zinc-300 hover:text-white backdrop-blur-xl text-xs font-mono transition active:scale-[0.96]"
              >
                <SlidersHorizontal size={13} weight="bold" className="text-amber-400" />
                <span className="hidden sm:inline">Customize</span>
              </button>
            )}

            {/* Key Settings Button */}
            <button
              onClick={() => {
                cosmicAudio.playClick();
                onTriggerApiKeyModal();
              }}
              title="Configure Nebius and Tavily API Keys"
              className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-xl flex items-center justify-center transition active:scale-[0.96]"
            >
              <Key size={15} weight="duotone" />
            </button>

            {/* Audio Play / Pause Toggle with Equalizer */}
            <button
              onClick={toggleAudio}
              title={audioState.isPlaying ? "Pause Deep Space Soundscape (Astrovia - Brown Dwarf)" : "Play Deep Space Soundscape"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-amber-400/30 text-zinc-300 hover:text-white backdrop-blur-xl text-xs font-mono transition active:scale-[0.96]"
            >
              {audioState.isPlaying ? (
                <>
                  <Pause size={13} weight="fill" className="text-amber-400" />
                  <span className="text-amber-300 hidden sm:inline">Cosmic Audio</span>
                </>
              ) : (
                <>
                  <Play size={13} weight="fill" className="text-zinc-400" />
                  <span className="text-zinc-400 hidden sm:inline">Play Audio</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                cosmicAudio.playClick();
                onClose();
              }}
              title="Close Cockpit"
              className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white backdrop-blur-xl flex items-center justify-center transition active:scale-[0.96]"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        </header>

        {/* Main Two-Column Spacious Cockpit Interior */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
          {/* Left/Center Column: Conversational Routing Stream (Spacious) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5 pb-4 lg:pb-0 lg:pr-4">
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
    </>
  );
}
