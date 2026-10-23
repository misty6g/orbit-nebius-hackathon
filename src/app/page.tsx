"use client";

import React, { useState, useEffect } from "react";
import {
  SpecialistId,
  SharedBrainProfile,
  MorningBriefData,
  PlanetCustomization,
  DEFAULT_PLANET_CUSTOMIZATIONS,
  normalizePlanetCustomization,
  NebulaCustomization,
  DEFAULT_NEBULA_CUSTOMIZATION,
} from "@/types/orbit";
import { DEFAULT_STUDENT_BRAIN, SPECIALISTS } from "@/lib/specialists";
import { SOLAR_DAWN_WAYPOINTS } from "@/lib/solarDawnTour";
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
  X,
  PlayCircle,
  Pause,
  Play,
  MagnifyingGlass,
  PaperPlaneRight,
  SlidersHorizontal,
  CaretUp,
  Check,
} from "@phosphor-icons/react";
import { cosmicAudio, AudioEngineState, CosmicTrackId, COSMIC_TRACKS } from "@/lib/audio";

export default function OrbitHome() {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<SpecialistId | null>(null);
  const [activeConstellationTargets, setActiveConstellationTargets] = useState<SpecialistId[]>([]);
  const [brain, setBrain] = useState<SharedBrainProfile>(DEFAULT_STUDENT_BRAIN);
  const [brief, setBrief] = useState<MorningBriefData | null>(null);

  // Modal States
  const [showAwakening, setShowAwakening] = useState<boolean>(false);
  /** Gate WebGL until localStorage bootstrap finishes so onboarding stays clickable. */
  const [bootstrapped, setBootstrapped] = useState<boolean>(false);
  const [showApiKeyGate, setShowApiKeyGate] = useState<boolean>(false);
  const [showBrainInspector, setShowBrainInspector] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [customizerPlanetId, setCustomizerPlanetId] = useState<SpecialistId | null>(null);

  // Exoplanet Customization State
  const [planetCustomizations, setPlanetCustomizations] = useState<Record<string, PlanetCustomization>>(DEFAULT_PLANET_CUSTOMIZATIONS);
  const [nebulaCustomization, setNebulaCustomization] = useState<NebulaCustomization>(
    DEFAULT_NEBULA_CUSTOMIZATION
  );

  // In-app credentials (browser localStorage). Server env is a host default when present.
  const [nebiusKey, setNebiusKey] = useState<string>("");
  const [tavilyKey, setTavilyKey] = useState<string>("");
  const [runtimeLive, setRuntimeLive] = useState<{
    nebius: boolean;
    tavily: boolean;
    model: string;
    routing?: string;
  } | null>(null);

  // Zen Ambient Audio State
  const [audioState, setAudioState] = useState<AudioEngineState>(cosmicAudio.getState());
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [showTrackPicker, setShowTrackPicker] = useState<boolean>(false);

  // Solar Dawn 3D Fly-Through Tour State
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Zen Quick Omnibox
  const [quickInput, setQuickInput] = useState<string>("");

  const tourNarrations = SOLAR_DAWN_WAYPOINTS;

  // Initial load
  useEffect(() => {
    // Optional hard reset back to Cosmic Awakening (e.g. /?reset=1)
    const params = new URLSearchParams(window.location.search);
    const forceAwaken = params.get("reset") === "1" || params.get("awaken") === "1";
    if (forceAwaken) {
      localStorage.removeItem("orbit_brain");
      localStorage.removeItem("orbit_awakened");
      params.delete("reset");
      params.delete("awaken");
      const next = `${window.location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      window.history.replaceState({}, "", next);
    }

    // Check localStorage for brain
    const savedBrain = localStorage.getItem("orbit_brain");
    const savedAwakened = localStorage.getItem("orbit_awakened");
    const savedNebiusKey = localStorage.getItem("orbit_nebius_key") || "";
    const savedTavilyKey = localStorage.getItem("orbit_tavily_key") || "";

    if (savedNebiusKey) setNebiusKey(savedNebiusKey);
    if (savedTavilyKey) setTavilyKey(savedTavilyKey);
    localStorage.removeItem("orbit_mock_mode");

    if (forceAwaken) {
      setShowAwakening(true);
    } else if (savedBrain) {
      try {
        setBrain(JSON.parse(savedBrain));
      } catch {}
    } else if (!savedAwakened) {
      setShowAwakening(true);
    }

    // If identity already calibrated but no browser Nebius key, open credentials
    // after runtime probe (see effect below) — in-app keys are the happy path.

    // Bump to refresh default palettes (vibrant Zen defaults).
    const PLANET_CUSTOM_VERSION = "v8c-vibrant-defaults";
    const savedCustomVersion = localStorage.getItem("orbit_planet_custom_version");
    if (savedCustomVersion !== PLANET_CUSTOM_VERSION) {
      localStorage.removeItem("orbit_planet_customizations");
      localStorage.setItem("orbit_planet_custom_version", PLANET_CUSTOM_VERSION);
      setPlanetCustomizations(DEFAULT_PLANET_CUSTOMIZATIONS);
    } else {
      const savedCustom = localStorage.getItem("orbit_planet_customizations");
      if (savedCustom) {
        try {
          const parsed = JSON.parse(savedCustom) as Record<
            string,
            Partial<PlanetCustomization>
          >;
          setPlanetCustomizations((prev) => {
            const next: Record<string, PlanetCustomization> = { ...prev };
            for (const [id, partial] of Object.entries(parsed)) {
              const fallback =
                DEFAULT_PLANET_CUSTOMIZATIONS[id] ||
                prev[id] ||
                DEFAULT_PLANET_CUSTOMIZATIONS.health;
              next[id] = normalizePlanetCustomization(partial, fallback);
            }
            return next;
          });
        } catch {}
      }
    }

    const savedNebula = localStorage.getItem("orbit_nebula_customization");
    if (savedNebula) {
      try {
        const parsed = JSON.parse(savedNebula) as Partial<NebulaCustomization>;
        setNebulaCustomization({
          ...DEFAULT_NEBULA_CUSTOMIZATION,
          ...parsed,
        });
      } catch {}
    }

    // Fetch morning brief
    fetch("/api/brief")
      .then((res) => res.json())
      .then((data) => setBrief(data))
      .catch(() => {});

    // Probe host Token Factory / Tavily (defaults). In-app keys still win when set.
    fetch("/api/runtime")
      .then((res) => res.json())
      .then((data) => {
        const serverNebius = Boolean(data?.inference?.live || data?.credentials?.serverNebius);
        const serverTavily = Boolean(data?.search?.live || data?.credentials?.serverTavily);
        setRuntimeLive({
          nebius: serverNebius,
          tavily: serverTavily,
          model: data?.inference?.model || "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
          routing:
            data?.inference?.routing ||
            "Orbit Core uses Nano to choose planets and response tier (Nano / Super / Ultra).",
        });

        const hasClientNebius = Boolean(
          (localStorage.getItem("orbit_nebius_key") || "").trim()
        );
        const awakened =
          localStorage.getItem("orbit_awakened") === "true" ||
          Boolean(localStorage.getItem("orbit_brain"));
        // Prompt for in-app keys when neither host nor browser has Nebius.
        if (awakened && !serverNebius && !hasClientNebius && !forceAwaken) {
          setShowApiKeyGate(true);
        }
      })
      .catch(() => {});

    // Allow WebGL only after we know whether onboarding must block it.
    setBootstrapped(true);
  }, []);

  const handleRecalibrateIdentity = () => {
    localStorage.removeItem("orbit_brain");
    localStorage.removeItem("orbit_awakened");
    setSelectedSpecialistId(null);
    setShowAwakening(true);
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
  };

  const handleUpdateBrain = (updated: SharedBrainProfile) => {
    setBrain(updated);
    localStorage.setItem("orbit_brain", JSON.stringify(updated));
  };

  const handleCompleteAwakening = (newProfile: SharedBrainProfile) => {
    setBrain(newProfile);
    localStorage.setItem("orbit_brain", JSON.stringify(newProfile));
    localStorage.setItem("orbit_awakened", "true");
    setShowAwakening(false);
    try {
      cosmicAudio.playWarp();
    } catch {
      /* ignore audio policy errors */
    }
    // Primary setup: if host has no Nebius and browser has none, open credentials.
    if (!runtimeLive?.nebius && !nebiusKey.trim()) {
      setShowApiKeyGate(true);
    }
  };

  const handleSaveKeys = (newNebius: string, newTavily: string) => {
    setNebiusKey(newNebius);
    setTavilyKey(newTavily);
    if (newNebius) {
      localStorage.setItem("orbit_nebius_key", newNebius);
    } else {
      localStorage.removeItem("orbit_nebius_key");
    }
    if (newTavily) {
      localStorage.setItem("orbit_tavily_key", newTavily);
    } else {
      localStorage.removeItem("orbit_tavily_key");
    }
  };

  useEffect(() => {
    return cosmicAudio.subscribe((state) => {
      setAudioState(state);
    });
  }, []);


  const toggleAudio = () => {
    cosmicAudio.toggleMusic();
  };

  const handleSelectTrack = (id: CosmicTrackId) => {
    cosmicAudio.playClick();
    cosmicAudio.setTrack(id, true);
    setShowTrackPicker(false);
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
      localStorage.setItem("orbit_planet_custom_version", "v8c-vibrant-defaults");
      return next;
    });
  };

  const handleUpdateNebula = (updated: NebulaCustomization) => {
    setNebulaCustomization(updated);
    localStorage.setItem("orbit_nebula_customization", JSON.stringify(updated));
  };

  const handleResetAllCustomizations = () => {
    setPlanetCustomizations(DEFAULT_PLANET_CUSTOMIZATIONS);
    localStorage.removeItem("orbit_planet_customizations");
    setNebulaCustomization(DEFAULT_NEBULA_CUSTOMIZATION);
    localStorage.removeItem("orbit_nebula_customization");
  };

  const handleOpenCustomizer = (id?: SpecialistId) => {
    cosmicAudio.playClick();
    if (id) {
      setCustomizerPlanetId(id);
    }
    setShowCustomizer(true);
  };

  // Deep-link: /?studio=health opens Planet Studio on that specialist.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const studioId = params.get("studio");
    if (!studioId) return;
    const id = studioId as SpecialistId;
    if (!SPECIALISTS[id] && !DEFAULT_PLANET_CUSTOMIZATIONS[id]) return;
    setCustomizerPlanetId(id);
    setShowCustomizer(true);
  }, []);

  const handleSelectSpecialist = (id: SpecialistId) => {
    if (isTouring) return;
    setSelectedSpecialistId(id);
    try {
      cosmicAudio.playWarp();
    } catch {
      /* ignore audio policy errors */
    }
  };

  const handleDeselect = () => {
    setSelectedSpecialistId(null);
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
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
      {/* Always-on soft backdrop so a stalled WebGL mount never looks like a hard crash.
          pointer-events-none so it can never steal clicks from onboarding or the dock. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #1a2238 0%, #0a0c14 55%, #050608 100%)",
        }}
      />

      {/* 3D Solar System WebGL Canvas — unmount during Cosmic Awakening and
          while Studio is open so onboarding stays interactive and Studio
          keeps a dedicated GL context (dual Canvas blacks out Studio). */}
      {bootstrapped && !showAwakening && !showCustomizer && (
        <SolarSystemCanvas
          selectedSpecialistId={selectedSpecialistId}
          onSelectSpecialist={handleSelectSpecialist}
          onDeselect={handleDeselect}
          activeConstellationTargets={activeConstellationTargets}
          isTouring={isTouring}
          tourStep={tourStep}
          planetCustomizations={planetCustomizations}
          nebulaCustomization={nebulaCustomization}
        />
      )}

      {/* Top Left Zen Brand Glyph */}
      {!showAwakening && !selectedSpecialistId && !isTouring && (
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <button
            type="button"
            title="Recalibrate identity (show startup)"
            onClick={handleRecalibrateIdentity}
            className="w-8 h-8 rounded-full bg-[rgba(10,10,20,0.6)] border border-white/5 backdrop-blur-2xl flex items-center justify-center shadow-zen-dock hover:border-amber-400/40 transition cursor-pointer active:scale-[0.96]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-amber-400 fill-none stroke-current stroke-[1.75]"
            >
              <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.4" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
          </button>
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
      {!showAwakening && !selectedSpecialistId && !isTouring && (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          {/* Planet Studio Customizer Button */}
          <button
            onClick={() => handleOpenCustomizer()}
            title="Open Exoplanet Customization Studio"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(10,10,20,0.45)] hover:bg-[rgba(10,10,20,0.65)] text-zinc-200 border border-white/5 text-xs font-medium backdrop-blur-2xl transition active:scale-[0.98] shadow-zen-dock"
          >
            <SlidersHorizontal size={14} weight="bold" className="text-amber-400" />
            <span>Planet Studio</span>
          </button>

          {/* Quick Play Brief Button */}
          <button
            onClick={startMorningTour}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(10,10,20,0.45)] hover:bg-[rgba(10,10,20,0.65)] text-zinc-200 border border-white/5 text-xs font-medium backdrop-blur-2xl transition active:scale-[0.98] shadow-zen-dock"
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
            className="w-8 h-8 rounded-full bg-[rgba(10,10,20,0.5)] hover:bg-[rgba(10,10,20,0.7)] border border-white/5 text-zinc-300 hover:text-white backdrop-blur-2xl flex items-center justify-center transition active:scale-[0.96] shadow-zen-dock"
          >
            <Brain size={15} weight="duotone" />
          </button>

          {/* Live Token Factory status (host default and/or in-app key) */}
          <div
            title={
              runtimeLive?.nebius || nebiusKey
                ? `Live NVIDIA Nemotron on Nebius Token Factory — ${runtimeLive?.routing || runtimeLive?.model || "in-app key"}`
                : "Open credentials to paste your Nebius Token Factory key"
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-2xl shadow-zen-dock ${
              runtimeLive?.nebius || nebiusKey
                ? "bg-amber-500/10 border-amber-400/40 text-amber-200"
                : "bg-[rgba(10,10,20,0.45)] border-white/10 text-zinc-400"
            }`}
          >
            <Sparkle
              size={12}
              weight="fill"
              className={runtimeLive?.nebius || nebiusKey ? "text-amber-400" : "text-zinc-500"}
            />
            <span>
              {runtimeLive?.nebius || nebiusKey
                ? "Live Nebius Token Factory"
                : "Add Token Factory key"}
            </span>
            {(runtimeLive?.tavily || tavilyKey) && (
              <span className="hidden sm:inline text-emerald-300/90 border-l border-white/10 pl-1.5 ml-0.5">
                + Tavily
              </span>
            )}
          </div>

          {/* In-app credentials (primary setup path) */}
          <button
            onClick={() => {
              try {
                cosmicAudio.playClick();
              } catch {
                /* ignore */
              }
              setShowApiKeyGate(true);
            }}
            title="Set Nebius & Tavily API keys in this browser"
            className="w-8 h-8 rounded-full bg-[rgba(10,10,20,0.5)] hover:bg-[rgba(10,10,20,0.7)] border border-white/5 text-zinc-300 hover:text-white backdrop-blur-2xl flex items-center justify-center transition active:scale-[0.96] shadow-zen-dock"
          >
            <Key size={15} weight="duotone" />
          </button>
        </div>
      )}

      {/* Bottom Left Zen Ambient Music Player with Volume + Track Picker */}
      {!showAwakening && !selectedSpecialistId && !isTouring && (
        <div className="absolute bottom-6 left-6 z-10 flex items-end gap-2">
          {/* Circular Play / Pause Button */}
          <button
            onClick={toggleAudio}
            title={audioState.isPlaying ? "Pause Cosmic Audio" : "Play Cosmic Audio"}
            className="w-9 h-9 rounded-full bg-[rgba(10,10,20,0.5)] hover:bg-[rgba(10,10,20,0.7)] border border-white/5 hover:border-amber-400/40 backdrop-blur-2xl flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-[0.96] shadow-zen-dock group"
          >
            {audioState.isPlaying ? (
              <Pause size={14} weight="fill" className="text-amber-400" />
            ) : (
              <Play size={14} weight="fill" className="text-zinc-300 ml-0.5 group-hover:text-amber-300 transition-colors" />
            )}
          </button>

          {/* Track pill + picker */}
          <div className="relative">
            {showTrackPicker && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTrackPicker(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 z-20 w-64 p-1.5 rounded-2xl bg-[rgba(10,10,20,0.92)] border border-white/10 backdrop-blur-2xl shadow-zen-dock">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Cosmic Audio
                  </div>
                  <div className="space-y-0.5">
                    {COSMIC_TRACKS.map((track) => {
                      const active = track.id === audioState.trackId;
                      return (
                        <button
                          key={track.id}
                          onClick={() => handleSelectTrack(track.id)}
                          className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition active:scale-[0.99] ${
                            active
                              ? "bg-amber-500/10 border border-amber-400/35"
                              : "border border-transparent hover:bg-white/5"
                          }`}
                        >
                          <span className="mt-0.5 w-4 shrink-0 flex justify-center">
                            {active ? (
                              <Check size={12} weight="bold" className="text-amber-400" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block text-[11px] font-mono ${
                                active ? "text-amber-200" : "text-zinc-200"
                              }`}
                            >
                              {track.title}
                            </span>
                            <span className="block text-[10px] font-mono text-zinc-500 truncate">
                              {track.subtitle}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => {
                cosmicAudio.playClick();
                setShowTrackPicker((v) => !v);
              }}
              title={`Select track · ${audioState.trackTitle}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(10,10,20,0.55)] border border-white/5 hover:border-white/10 backdrop-blur-2xl cursor-pointer transition shadow-zen-dock active:scale-[0.98] group"
            >
              <div className="flex items-end gap-1 h-4">
                <span
                  className={`w-0.5 rounded-full transition-all ${
                    audioState.isPlaying && !audioState.isMuted
                      ? "zen-eq-bar-1 bg-amber-400"
                      : "h-1.5 bg-zinc-500 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full transition-all ${
                    audioState.isPlaying && !audioState.isMuted
                      ? "zen-eq-bar-2 bg-amber-300"
                      : "h-2.5 bg-zinc-400 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full transition-all ${
                    audioState.isPlaying && !audioState.isMuted
                      ? "zen-eq-bar-3 bg-amber-400"
                      : "h-3.5 bg-amber-400/50 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full transition-all ${
                    audioState.isPlaying && !audioState.isMuted
                      ? "zen-eq-bar-4 bg-amber-300"
                      : "h-2 bg-zinc-400 opacity-40"
                  }`}
                />
                <span
                  className={`w-0.5 rounded-full transition-all ${
                    audioState.isPlaying && !audioState.isMuted
                      ? "zen-eq-bar-5 bg-amber-400"
                      : "h-1.5 bg-zinc-500 opacity-40"
                  }`}
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200 transition max-w-[9.5rem] truncate">
                {audioState.isPlaying ? audioState.trackTitle : "Cosmic Audio"}
              </span>
              <CaretUp
                size={11}
                weight="bold"
                className={`text-zinc-500 transition ${showTrackPicker ? "rotate-180 text-amber-400" : ""}`}
              />
            </button>
          </div>

          {/* Volume Control Pill with Hover/Click Slider */}
          <div
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[rgba(10,10,20,0.55)] border border-white/5 hover:border-white/10 backdrop-blur-2xl transition shadow-zen-dock"
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
      {!showAwakening && !selectedSpecialistId && !isTouring && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl px-4 flex flex-col items-center">
          <div className="w-full p-2 rounded-2xl bg-[rgba(10,10,20,0.45)] border border-white/5 backdrop-blur-2xl shadow-zen-dock space-y-2">
            {/* Zen Command Bar Input */}
            <form
              onSubmit={handleQuickSubmit}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[rgba(10,10,20,0.35)] border border-white/5 hover:border-white/10 transition group"
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
          tavilyKey={tavilyKey}
          serverInferenceLive={Boolean(runtimeLive?.nebius || nebiusKey)}
          serverModel={runtimeLive?.model}
          tavilyLive={Boolean(runtimeLive?.tavily || tavilyKey)}
        />
      )}

      {/* Cosmic Awakening Modal */}
      {showAwakening && (
        <CosmicAwakeningModal onComplete={handleCompleteAwakening} />
      )}

      {/* In-app API credentials (primary path; host env is optional default) */}
      <ApiKeyGateModal
        isOpen={showApiKeyGate}
        onClose={() => setShowApiKeyGate(false)}
        onSaveKeys={handleSaveKeys}
        currentNebiusKey={nebiusKey}
        currentTavilyKey={tavilyKey}
        requireNebius={!runtimeLive?.nebius && !nebiusKey.trim()}
        serverHasNebius={Boolean(runtimeLive?.nebius)}
        serverHasTavily={Boolean(runtimeLive?.tavily)}
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
        nebulaCustomization={nebulaCustomization}
        onUpdateNebula={handleUpdateNebula}
      />
    </main>
  );
}
