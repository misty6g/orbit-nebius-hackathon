"use client";

import React, { useState, useEffect } from "react";
import { SpecialistId, SharedBrainProfile, MorningBriefData } from "@/types/orbit";
import { INITIAL_DEMO_BRAIN, SPECIALISTS } from "@/lib/specialists";
import { SolarSystemCanvas } from "@/components/cosmos/SolarSystemCanvas";
import { CockpitHUD } from "@/components/hud/CockpitHUD";
import { CosmicAwakeningModal } from "@/components/onboarding/CosmicAwakeningModal";
import { ApiKeyGateModal } from "@/components/shared/ApiKeyGateModal";
import { BrainInspectorModal } from "@/components/shared/BrainInspectorModal";
import {
  SpeakerHigh,
  SpeakerSlash,
  Key,
  Brain,
  Sparkle,
  FastForward,
  X,
  PlayCircle,
  Lightning,
  Pause,
  Play,
  MagnifyingGlass,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

export default function OrbitHome() {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<SpecialistId | null>(null);
  const [activeConstellationTargets, setActiveConstellationTargets] = useState<SpecialistId[]>([]);
  const [brain, setBrain] = useState<SharedBrainProfile>(INITIAL_DEMO_BRAIN);
  const [brief, setBrief] = useState<MorningBriefData | null>(null);

  // Modal States
  const [showAwakening, setShowAwakening] = useState<boolean>(false);
  const [showApiKeyGate, setShowApiKeyGate] = useState<boolean>(false);
  const [showBrainInspector, setShowBrainInspector] = useState<boolean>(false);

  // Credentials & Mode
  const [nebiusKey, setNebiusKey] = useState<string>("");
  const [tavilyKey, setTavilyKey] = useState<string>("");
  const [mockMode, setMockMode] = useState<boolean>(true);

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Solar Dawn 3D Fly-Through Tour State
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Zen Quick Omnibox
  const [quickInput, setQuickInput] = useState<string>("");

  const tourNarrations = [
    {
      title: "Solar Dawn Briefing: Orbit Core",
      subtitle: "Rochester Institute of Technology • Men's Volleyball & AI BS '28",
      content: "Good morning, Gyan. Initializing daily unified briefing across your 9 domains.",
    },
    {
      title: "Waypoint 1: Orbit Schedule",
      subtitle: "Primary Academic & Athletic Sync",
      content: "CSCI 320 at 10 AM, Computer Vision at 2 PM, and Men's Volleyball Practice at 6 PM. No course conflicts.",
    },
    {
      title: "Waypoint 2: Orbit Health",
      subtitle: "3,100 kcal Bulk Pacing",
      content: "Breakfast oats and protein logged (~740 kcal). Pre-practice high-protein snack scheduled for 4:45 PM.",
    },
    {
      title: "Waypoint 3: Orbit Wallet",
      subtitle: "Sovereign Monthly Cashflow",
      content: "$540.36 buffer remaining under your $800 monthly cap. Soft limit cleared for break travel look-ahead.",
    },
    {
      title: "Solar Dawn Complete",
      subtitle: "Orbit Core Ready for Commands",
      content: "All specialists synchronized in Sovereign Memory. Ready for your daily schedule.",
    },
  ];

  // Initial load
  useEffect(() => {
    // Check localStorage for brain
    const savedBrain = localStorage.getItem("orbit_brain");
    const savedAwakened = localStorage.getItem("orbit_awakened");
    const savedNebiusKey = localStorage.getItem("orbit_nebius_key") || "";
    const savedTavilyKey = localStorage.getItem("orbit_tavily_key") || "";

    if (savedNebiusKey) setNebiusKey(savedNebiusKey);
    if (savedTavilyKey) setTavilyKey(savedTavilyKey);

    const savedMockMode = localStorage.getItem("orbit_mock_mode");
    if (savedMockMode !== null) {
      setMockMode(savedMockMode === "true");
    } else {
      setMockMode(true);
    }

    if (savedBrain) {
      try {
        setBrain(JSON.parse(savedBrain));
      } catch {}
    } else if (!savedAwakened) {
      setShowAwakening(true);
    }

    // Fetch morning brief
    fetch("/api/brief")
      .then((res) => res.json())
      .then((data) => setBrief(data))
      .catch(() => {});
  }, []);

  const handleUpdateBrain = (updated: SharedBrainProfile) => {
    setBrain(updated);
    localStorage.setItem("orbit_brain", JSON.stringify(updated));
  };

  const handleCompleteAwakening = (newProfile: SharedBrainProfile) => {
    setBrain(newProfile);
    localStorage.setItem("orbit_brain", JSON.stringify(newProfile));
    localStorage.setItem("orbit_awakened", "true");
    setShowAwakening(false);
    cosmicAudio.playWarp();
  };

  const handleQuickDemoFill = () => {
    setBrain(INITIAL_DEMO_BRAIN);
    localStorage.setItem("orbit_brain", JSON.stringify(INITIAL_DEMO_BRAIN));
    localStorage.setItem("orbit_awakened", "true");
    setShowAwakening(false);
    cosmicAudio.playChime();
  };

  const handleSaveKeys = (newNebius: string, newTavily: string) => {
    setNebiusKey(newNebius);
    setTavilyKey(newTavily);
    localStorage.setItem("orbit_nebius_key", newNebius);
    localStorage.setItem("orbit_tavily_key", newTavily);
  };

  const handleToggleMockMode = () => {
    cosmicAudio.playClick();
    setMockMode((prev) => {
      const next = !prev;
      localStorage.setItem("orbit_mock_mode", String(next));
      return next;
    });
  };

  const toggleAudio = () => {
    const nextMuted = cosmicAudio.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSelectSpecialist = (id: SpecialistId) => {
    if (isTouring) return;
    cosmicAudio.playWarp();
    setSelectedSpecialistId(id);
  };

  const handleDeselect = () => {
    cosmicAudio.playClick();
    setSelectedSpecialistId(null);
  };

  const startMorningTour = () => {
    setSelectedSpecialistId(null);
    setIsTouring(true);
    setTourStep(0);
  };

  const nextTourStep = () => {
    cosmicAudio.playWarp();
    if (tourStep < tourNarrations.length - 1) {
      setTourStep((prev) => prev + 1);
    } else {
      setIsTouring(false);
      setSelectedSpecialistId("core");
    }
  };

  const skipTour = () => {
    cosmicAudio.playClick();
    setIsTouring(false);
    setSelectedSpecialistId("core");
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    cosmicAudio.playWarp();
    setSelectedSpecialistId("core");
    // Passing prompt via storage / state
    sessionStorage.setItem("orbit_pending_prompt", quickInput.trim());
    setQuickInput("");
  };

  const planetList = Object.values(SPECIALISTS).filter((s) => s.id !== "core");

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07080a] font-sans">
      {/* 3D Solar System WebGL Canvas */}
      <SolarSystemCanvas
        selectedSpecialistId={selectedSpecialistId}
        onSelectSpecialist={handleSelectSpecialist}
        onDeselect={handleDeselect}
        activeConstellationTargets={activeConstellationTargets}
        isTouring={isTouring}
        tourStep={tourStep}
      />

      {/* Top Left Zen Brand Glyph (Matching reference screenshot) */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-950/60 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-glass-sm hover:border-white/20 transition cursor-pointer">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-zinc-300 fill-none stroke-current stroke-[1.5]"
            >
              <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.3" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
          </div>
          <span className="text-xs font-display font-medium text-zinc-300 tracking-wider">
            ORBIT
          </span>
        </div>
      )}

      {/* Top Right Zen Controls */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2.5">
          {/* Zero-Credit Testing Mode Pill */}
          <button
            onClick={handleToggleMockMode}
            title={mockMode ? "Mock AI Active (Zero Credits Spent) • Click to toggle Live Nebius" : "Live Nebius Active • Click to switch to Mock AI"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono backdrop-blur-xl transition active:scale-[0.98] border ${
              mockMode
                ? "bg-emerald-950/70 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "bg-amber-950/70 border-amber-500/30 text-amber-300 hover:bg-amber-900/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            }`}
          >
            <Lightning size={12} weight="fill" className={mockMode ? "text-emerald-400 animate-pulse" : "text-amber-400"} />
            <span>{mockMode ? "Mock AI (0 Credits)" : "Live Nebius"}</span>
          </button>

          {/* Quick Play Brief Button */}
          <button
            onClick={startMorningTour}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950/70 hover:bg-zinc-900/80 text-zinc-200 border border-white/10 text-xs font-display backdrop-blur-xl transition active:scale-[0.98] shadow-glass-sm"
          >
            <PlayCircle size={15} weight="duotone" className="text-amber-400" />
            <span>Solar Dawn Tour</span>
          </button>

          {/* Inspect Brain */}
          <button
            onClick={() => {
              cosmicAudio.playClick();
              setShowBrainInspector(true);
            }}
            title="Inspect Sovereign Shared Brain"
            className="p-2 rounded-full bg-zinc-950/70 hover:bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-xl transition active:scale-[0.98]"
          >
            <Brain size={15} weight="duotone" />
          </button>

          {/* Credentials Gate */}
          <button
            onClick={() => {
              cosmicAudio.playClick();
              setShowApiKeyGate(true);
            }}
            title="Configure Nebius & Tavily Keys"
            className="p-2 rounded-full bg-zinc-950/70 hover:bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-xl transition active:scale-[0.98]"
          >
            <Key size={15} weight="duotone" />
          </button>
        </div>
      )}

      {/* Bottom Left Audio Waveform Pill (Matching user's reference screenshot) */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
          <button
            onClick={toggleAudio}
            title={isMuted ? "Resume Cosmic Soundscape" : "Pause Cosmic Soundscape"}
            className="w-8 h-8 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 backdrop-blur-xl flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-[0.96] shadow-glass-sm"
          >
            {isMuted ? <Play size={12} weight="fill" /> : <Pause size={12} weight="fill" />}
          </button>

          {/* Waveform Pill */}
          <div
            onClick={toggleAudio}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl cursor-pointer hover:border-white/20 transition shadow-glass-sm"
          >
            <span
              className={`w-0.5 rounded-full bg-zinc-400 transition-all ${
                isMuted ? "h-1.5 opacity-40" : "h-3.5 animate-pulse"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-zinc-300 transition-all ${
                isMuted ? "h-2 opacity-40" : "h-5 animate-pulse delay-75"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-amber-400 transition-all ${
                isMuted ? "h-3 opacity-40" : "h-2.5 animate-pulse delay-150"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-zinc-300 transition-all ${
                isMuted ? "h-1.5 opacity-40" : "h-4 animate-pulse delay-100"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-zinc-400 transition-all ${
                isMuted ? "h-2 opacity-40" : "h-2 animate-pulse delay-200"
              }`}
            />
          </div>
        </div>
      )}

      {/* Center Bottom Zen Command Bar & Planet Warp Strip (Perplexity Zen style) */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4 flex flex-col items-center gap-2.5">
          {/* Zen Command Bar Input */}
          <form
            onSubmit={handleQuickSubmit}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-950/80 hover:bg-zinc-950/95 border border-white/10 hover:border-white/20 backdrop-blur-2xl shadow-2xl transition group"
          >
            <Sparkle size={15} weight="duotone" className="text-amber-400 shrink-0" />
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask Orbit Core anything or select a planet..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="p-1 rounded-full text-zinc-400 group-hover:text-white disabled:opacity-30 transition"
            >
              <PaperPlaneRight size={14} weight="bold" />
            </button>
          </form>

          {/* Minimalist Planet Warp Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-950/60 border border-white/5 backdrop-blur-xl overflow-x-auto max-w-full">
            <button
              onClick={() => handleSelectSpecialist("core")}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition whitespace-nowrap"
            >
              Orbit Core
            </button>
            {planetList.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectSpecialist(p.id)}
                title={`${p.name} (${p.domain})`}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name.replace("Orbit ", "")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Solar Dawn Tour Projection Card */}
      {isTouring && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-md p-5 rounded-2xl bg-zinc-950/90 border border-amber-400/30 backdrop-blur-2xl shadow-solar-glow text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-amber-300 font-semibold">
              {tourNarrations[tourStep]?.title}
            </span>
            <span className="text-gray-400">
              {tourStep + 1} / {tourNarrations.length}
            </span>
          </div>

          <div className="text-[11px] font-mono text-cyan-300 mb-1">
            {tourNarrations[tourStep]?.subtitle}
          </div>
          <p className="text-xs text-gray-200 leading-relaxed mb-4">
            {tourNarrations[tourStep]?.content}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={skipTour}
              className="px-3 py-1.5 rounded-lg text-xs font-display text-gray-400 hover:text-white transition"
            >
              Skip Tour
            </button>
            <button
              onClick={nextTourStep}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-semibold text-xs transition active:scale-[0.98]"
            >
              {tourStep < tourNarrations.length - 1 ? "Next Waypoint" : "Enter Orbit Core"}
            </button>
          </div>
        </div>
      )}

      {/* Cockpit HUD View when Zoomed Into Specialist */}
      {selectedSpecialistId && !isTouring && (
        <CockpitHUD
          specialistId={selectedSpecialistId}
          brain={brain}
          brief={brief}
          onClose={handleDeselect}
          onUpdateBrain={handleUpdateBrain}
          onPlayMorningTour={startMorningTour}
          onOpenBrainInspector={() => setShowBrainInspector(true)}
          onTriggerApiKeyModal={() => setShowApiKeyGate(true)}
          onActiveTargetsChange={setActiveConstellationTargets}
          apiKey={nebiusKey}
          mockMode={mockMode}
          onToggleMockMode={handleToggleMockMode}
        />
      )}

      {/* Cosmic Awakening Modal */}
      {showAwakening && (
        <CosmicAwakeningModal
          onComplete={handleCompleteAwakening}
          onQuickDemoFill={handleQuickDemoFill}
        />
      )}

      {/* API Key Modal */}
      <ApiKeyGateModal
        isOpen={showApiKeyGate}
        onClose={() => setShowApiKeyGate(false)}
        onSaveKeys={handleSaveKeys}
        currentNebiusKey={nebiusKey}
        currentTavilyKey={tavilyKey}
        mockMode={mockMode}
        onToggleMockMode={handleToggleMockMode}
      />

      {/* Shared Brain Inspector Modal */}
      <BrainInspectorModal
        isOpen={showBrainInspector}
        onClose={() => setShowBrainInspector(false)}
        brain={brain}
      />
    </main>
  );
}
