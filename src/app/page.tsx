"use client";

import React, { useState, useEffect } from "react";
import { SpecialistId, SharedBrainProfile, MorningBriefData, PlanetCustomization, DEFAULT_PLANET_CUSTOMIZATIONS } from "@/types/orbit";
import { INITIAL_DEMO_BRAIN, SPECIALISTS } from "@/lib/specialists";
import { SolarSystemCanvas } from "@/components/cosmos/SolarSystemCanvas";
import { CockpitHUD } from "@/components/hud/CockpitHUD";
import { CosmicAwakeningModal } from "@/components/onboarding/CosmicAwakeningModal";
import { ApiKeyGateModal } from "@/components/shared/ApiKeyGateModal";
import { BrainInspectorModal } from "@/components/shared/BrainInspectorModal";
import { PlanetCustomizerModal } from "@/components/cosmos/PlanetCustomizerModal";
import {
  SpeakerHigh,
  SpeakerSlash,
  SpeakerLow,
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
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { cosmicAudio, AudioEngineState } from "@/lib/audio";

export default function OrbitHome() {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<SpecialistId | null>(null);
  const [activeConstellationTargets, setActiveConstellationTargets] = useState<SpecialistId[]>([]);
  const [brain, setBrain] = useState<SharedBrainProfile>(INITIAL_DEMO_BRAIN);
  const [brief, setBrief] = useState<MorningBriefData | null>(null);

  // Modal States
  const [showAwakening, setShowAwakening] = useState<boolean>(false);
  const [showApiKeyGate, setShowApiKeyGate] = useState<boolean>(false);
  const [showBrainInspector, setShowBrainInspector] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [customizerPlanetId, setCustomizerPlanetId] = useState<SpecialistId | null>(null);

  // Exoplanet Customization State
  const [planetCustomizations, setPlanetCustomizations] = useState<Record<string, PlanetCustomization>>(DEFAULT_PLANET_CUSTOMIZATIONS);

  // Credentials & Mode
  const [nebiusKey, setNebiusKey] = useState<string>("");
  const [tavilyKey, setTavilyKey] = useState<string>("");
  const [mockMode, setMockMode] = useState<boolean>(true);

  // Zen Ambient Audio State
  const [audioState, setAudioState] = useState<AudioEngineState>(cosmicAudio.getState());
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

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
      setMockMode(false);
    }

    if (savedBrain) {
      try {
        setBrain(JSON.parse(savedBrain));
      } catch {}
    } else if (!savedAwakened) {
      setShowAwakening(true);
    }

    const savedCustom = localStorage.getItem("orbit_planet_customizations");
    if (savedCustom) {
      try {
        setPlanetCustomizations((prev) => ({ ...prev, ...JSON.parse(savedCustom) }));
      } catch {}
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

  useEffect(() => {
    return cosmicAudio.subscribe((state) => {
      setAudioState(state);
    });
  }, []);

  const handleToggleMockMode = () => {
    cosmicAudio.playClick();
    setMockMode((prev) => {
      const next = !prev;
      localStorage.setItem("orbit_mock_mode", String(next));
      return next;
    });
  };

  const toggleAudio = () => {
    cosmicAudio.toggleMusic();
  };

  const handleVolumeChange = (newVol: number) => {
    if (audioState.isMuted) {
      cosmicAudio.setMuted(false);
    }
    cosmicAudio.setVolume(newVol);
  };

  const toggleMute = () => {
    cosmicAudio.toggleMute();
  };

  const handleUpdateCustomization = (id: SpecialistId, updated: PlanetCustomization) => {
    setPlanetCustomizations((prev) => {
      const next = { ...prev, [id]: updated };
      localStorage.setItem("orbit_planet_customizations", JSON.stringify(next));
      return next;
    });
  };

  const handleResetAllCustomizations = () => {
    setPlanetCustomizations(DEFAULT_PLANET_CUSTOMIZATIONS);
    localStorage.removeItem("orbit_planet_customizations");
  };

  const handleOpenCustomizer = (id?: SpecialistId) => {
    cosmicAudio.playClick();
    if (id) {
      setCustomizerPlanetId(id);
    }
    setShowCustomizer(true);
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
        planetCustomizations={planetCustomizations}
      />

      {/* Top Left Zen Brand Glyph */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-glass-sm hover:border-white/20 transition cursor-pointer active:scale-[0.96]">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-amber-400 fill-none stroke-current stroke-[1.75]"
            >
              <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.4" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-semibold text-zinc-200 tracking-wider">
              ORBIT
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Sovereign Student OS
            </span>
          </div>
        </div>
      )}

      {/* Top Right Zen Controls */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          {/* Zero-Credit Testing Mode Pill */}
          <button
            onClick={handleToggleMockMode}
            title={mockMode ? "Mock AI Active (Zero Credits) - Click to toggle Live Nebius" : "Live Nebius Active - Click to switch to Mock AI"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono backdrop-blur-xl transition active:scale-[0.98] border ${
              mockMode
                ? "bg-zinc-900/90 border-emerald-500/40 text-emerald-300 hover:bg-zinc-800/90"
                : "bg-zinc-900/90 border-amber-500/40 text-amber-300 hover:bg-zinc-800/90"
            }`}
          >
            <Lightning size={12} weight="fill" className={mockMode ? "text-emerald-400" : "text-amber-400"} />
            <span>{mockMode ? "Mock AI (0 Credits)" : "Live Nebius"}</span>
          </button>

          {/* Planet Studio Customizer Button */}
          <button
            onClick={() => handleOpenCustomizer()}
            title="Open Exoplanet Customization Studio"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium backdrop-blur-xl transition active:scale-[0.98] shadow-glass-sm"
          >
            <SlidersHorizontal size={14} weight="bold" className="text-amber-400" />
            <span>Planet Studio</span>
          </button>

          {/* Quick Play Brief Button */}
          <button
            onClick={startMorningTour}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium backdrop-blur-xl transition active:scale-[0.98] shadow-glass-sm"
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
            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-xl flex items-center justify-center transition active:scale-[0.96]"
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
            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-xl flex items-center justify-center transition active:scale-[0.96]"
          >
            <Key size={15} weight="duotone" />
          </button>
        </div>
      )}

      {/* Bottom Left Zen Ambient Music Player with Volume Control */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
          {/* Circular Play / Pause Button */}
          <button
            onClick={toggleAudio}
            title={audioState.isPlaying ? "Pause Zen Ambient Music" : "Play Zen Ambient Music"}
            className="w-9 h-9 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-[0.96] shadow-glass-sm group"
          >
            {audioState.isPlaying ? (
              <Pause size={14} weight="fill" className="text-amber-400" />
            ) : (
              <Play size={14} weight="fill" className="text-zinc-300 ml-0.5 group-hover:text-amber-300 transition-colors" />
            )}
          </button>

          {/* Equalizer Waveform Pill with Track Info */}
          <button
            onClick={toggleAudio}
            title={audioState.isPlaying ? "Pause Deep Space Soundscape (Astrovia - Brown Dwarf)" : "Play Deep Space Soundscape (Astrovia - Brown Dwarf)"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/90 border border-white/10 hover:border-white/20 backdrop-blur-xl cursor-pointer transition shadow-glass-sm active:scale-[0.98] group"
          >
            <div className="flex items-end gap-1 h-4">
              <span
                className={`w-0.5 rounded-full transition-all ${
                  audioState.isPlaying && !audioState.isMuted ? "zen-eq-bar-1 bg-amber-400" : "h-1.5 bg-zinc-500 opacity-40"
                }`}
              />
              <span
                className={`w-0.5 rounded-full transition-all ${
                  audioState.isPlaying && !audioState.isMuted ? "zen-eq-bar-2 bg-amber-300" : "h-2.5 bg-zinc-400 opacity-40"
                }`}
              />
              <span
                className={`w-0.5 rounded-full transition-all ${
                  audioState.isPlaying && !audioState.isMuted ? "zen-eq-bar-3 bg-amber-400" : "h-3.5 bg-amber-400/50 opacity-40"
                }`}
              />
              <span
                className={`w-0.5 rounded-full transition-all ${
                  audioState.isPlaying && !audioState.isMuted ? "zen-eq-bar-4 bg-amber-300" : "h-2 bg-zinc-400 opacity-40"
                }`}
              />
              <span
                className={`w-0.5 rounded-full transition-all ${
                  audioState.isPlaying && !audioState.isMuted ? "zen-eq-bar-5 bg-amber-400" : "h-1.5 bg-zinc-500 opacity-40"
                }`}
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200 transition">
              {audioState.isPlaying ? "Deep Space Ambient" : "Cosmic Audio"}
            </span>
          </button>

          {/* Volume Control Pill with Hover/Click Slider */}
          <div
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-950/90 border border-white/10 hover:border-white/20 backdrop-blur-xl transition shadow-glass-sm"
          >
            <button
              onClick={toggleMute}
              title={audioState.isMuted ? "Unmute Volume" : "Mute Volume"}
              className="text-zinc-400 hover:text-white transition active:scale-[0.96]"
            >
              {audioState.isMuted || audioState.volume === 0 ? (
                <SpeakerSlash size={14} weight="bold" className="text-zinc-500" />
              ) : audioState.volume < 0.4 ? (
                <SpeakerLow size={14} weight="bold" className="text-zinc-300" />
              ) : (
                <SpeakerHigh size={14} weight="bold" className="text-amber-400" />
              )}
            </button>

            {/* Expandable Slider */}
            <div
              className={`flex items-center gap-1.5 overflow-hidden transition-all duration-200 ${
                showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0 pointer-events-none"
              }`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioState.isMuted ? 0 : audioState.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                title={`Volume: ${Math.round((audioState.isMuted ? 0 : audioState.volume) * 100)}%`}
              />
              <span className="text-[10px] font-mono text-zinc-400 select-none">
                {Math.round((audioState.isMuted ? 0 : audioState.volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Center Bottom Integrated Zen Command Dock (Perplexity Zen style) */}
      {!selectedSpecialistId && !isTouring && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4 flex flex-col items-center">
          <div className="w-full p-2 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-2xl shadow-zen-dock space-y-2">
            {/* Zen Command Bar Input */}
            <form
              onSubmit={handleQuickSubmit}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition group"
            >
              <Sparkle size={15} weight="duotone" className="text-amber-400 shrink-0" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Ask Orbit Core anything or select a domain below..."
                className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!quickInput.trim()}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 text-[11px] font-mono transition flex items-center gap-1 active:scale-[0.98]"
              >
                <span>Ask</span>
                <PaperPlaneRight size={11} weight="bold" />
              </button>
            </form>

            {/* Planet Domain Quick Warp Pills */}
            <div className="flex items-center gap-1 px-1 overflow-x-auto max-w-full">
              <button
                onClick={() => handleSelectSpecialist("core")}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition whitespace-nowrap active:scale-[0.98]"
              >
                Orbit Core
              </button>
              {planetList.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectSpecialist(p.id)}
                  title={`${p.name} (${p.domain})`}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition whitespace-nowrap active:scale-[0.98]"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span>{p.name.replace("Orbit ", "")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Solar Dawn Tour Projection Card */}
      {isTouring && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-md p-5 rounded-2xl bg-zinc-950/95 border border-white/15 backdrop-blur-2xl shadow-glass-lg text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-amber-300 font-medium">
              {tourNarrations[tourStep]?.title}
            </span>
            <span className="text-zinc-500">
              {tourStep + 1} / {tourNarrations.length}
            </span>
          </div>

          <div className="text-[11px] font-mono text-cyan-300 mb-1">
            {tourNarrations[tourStep]?.subtitle}
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            {tourNarrations[tourStep]?.content}
          </p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={skipTour}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              Skip Tour
            </button>
            <button
              onClick={nextTourStep}
              className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition active:scale-[0.98]"
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
          onOpenCustomizer={handleOpenCustomizer}
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

      {/* Exoplanet Studio Customizer Modal */}
      <PlanetCustomizerModal
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        customizations={planetCustomizations}
        onUpdateCustomization={handleUpdateCustomization}
        onResetAll={handleResetAllCustomizations}
        initialPlanetId={customizerPlanetId}
      />
    </main>
  );
}
