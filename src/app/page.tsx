"use client";

import React, { useState, useEffect } from "react";
import { SpecialistId, SharedBrainProfile, MorningBriefData } from "@/types/orbit";
import { INITIAL_DEMO_BRAIN } from "@/lib/specialists";
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

  // Credentials
  const [nebiusKey, setNebiusKey] = useState<string>("");
  const [tavilyKey, setTavilyKey] = useState<string>("");

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Solar Dawn 3D Fly-Through Tour State
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

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

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-space-950 font-sans">
      {/* 3D Solar System WebGL Canvas */}
      <SolarSystemCanvas
        selectedSpecialistId={selectedSpecialistId}
        onSelectSpecialist={handleSelectSpecialist}
        onDeselect={handleDeselect}
        activeConstellationTargets={activeConstellationTargets}
        isTouring={isTouring}
        tourStep={tourStep}
      />

      {/* Minimalist Cosmos Telemetry Header (Visible only when in Overview) */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md shadow-glass-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-solar-glow animate-pulse" />
            <span className="text-xs font-display font-semibold tracking-wider text-white">
              ORBIT
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              Sovereign Student OS
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Quick Play Brief Button */}
            <button
              onClick={startMorningTour}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-display backdrop-blur-md transition active:scale-[0.98] shadow-solar-glow"
            >
              <PlayCircle size={14} weight="fill" />
              <span>Solar Dawn Tour</span>
            </button>

            {/* Inspect Brain */}
            <button
              onClick={() => {
                cosmicAudio.playClick();
                setShowBrainInspector(true);
              }}
              title="Inspect Sovereign Shared Brain"
              className="p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-gray-300 hover:text-white backdrop-blur-md transition active:scale-[0.98]"
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
              className="p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-gray-300 hover:text-white backdrop-blur-md transition active:scale-[0.98]"
            >
              <Key size={15} weight="duotone" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              title={isMuted ? "Unmute Cosmic Audio" : "Mute Cosmic Audio"}
              className="p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-gray-300 hover:text-white backdrop-blur-md transition active:scale-[0.98]"
            >
              {isMuted ? (
                <SpeakerSlash size={15} weight="duotone" className="text-gray-400" />
              ) : (
                <SpeakerHigh size={15} weight="duotone" className="text-amber-400" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Solar Dawn Tour Projection Card */}
      {isTouring && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-md p-5 rounded-2xl bg-space-900/90 border border-amber-400/30 backdrop-blur-xl shadow-solar-glow text-white">
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
