"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  SpecialistId,
  PlanetCustomization,
  PlanetArchetype,
  RingStyle,
  CustomMoonConfig,
  DEFAULT_PLANET_CUSTOMIZATIONS,
} from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { generateExoplanetTextures, generateExoplanetRingTexture } from "@/lib/exoplanetTextures";
import {
  X,
  Plus,
  Trash,
  ArrowCounterClockwise,
  Check,
  Sparkle,
  SlidersHorizontal,
  Circle,
} from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface PlanetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customizations: Record<string, PlanetCustomization>;
  onUpdateCustomization: (id: SpecialistId, updated: PlanetCustomization) => void;
  onResetAll: () => void;
  initialPlanetId?: SpecialistId | null;
}

// 3D Live Preview Mesh for the customizer canvas
function CustomizerPreviewMesh({ custom }: { custom: PlanetCustomization }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<Array<THREE.Group | null>>([]);
  const moonAngles = useRef<number[]>([0, 2, 4]);

  const textures = useMemo(() => {
    return generateExoplanetTextures(custom);
  }, [custom]);

  const ringTexture = useMemo(() => {
    if (custom.hasRings && custom.ringStyle !== "none") {
      return generateExoplanetRingTexture(custom.ringStyle, custom.ringColor);
    }
    return null;
  }, [custom.hasRings, custom.ringStyle, custom.ringColor]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }

    custom.moons.forEach((moon, idx) => {
      if (!moonAngles.current[idx]) moonAngles.current[idx] = 0;
      moonAngles.current[idx] += delta * moon.speed * 0.9;

      const el = moonRefs.current[idx];
      if (el) {
        const mx = Math.cos(moonAngles.current[idx]) * (1.8 * moon.distance);
        const mz = Math.sin(moonAngles.current[idx]) * (1.8 * moon.distance);
        el.position.set(mx, 0, mz);
      }
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Directional Key Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 3, 5]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#94a3b8" />

      {/* Primary Planet Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshStandardMaterial
          map={textures.colorMap}
          bumpMap={textures.bumpMap}
          bumpScale={custom.bumpScale}
          roughness={custom.roughness}
          metalness={0.06}
        />
      </mesh>

      {/* Atmospheric Rayleigh Limb Glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.75, 32, 32]} />
        <meshBasicMaterial
          color={custom.secondaryColor}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Concentric Rings */}
      {custom.hasRings && ringTexture && (
        <mesh rotation={[-Math.PI / 3.2, custom.ringTilt, 0]}>
          <ringGeometry args={[2.2, 3.8, 96]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
            roughness={0.25}
            metalness={0.04}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Orbiting Moons */}
      {custom.moons.map((moon, idx) => (
        <group
          key={moon.id || idx}
          ref={(el) => {
            moonRefs.current[idx] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[moon.size * 1.2, 24, 24]} />
            <meshStandardMaterial
              color={moon.color}
              roughness={0.45}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function PlanetCustomizerModal({
  isOpen,
  onClose,
  customizations,
  onUpdateCustomization,
  onResetAll,
  initialPlanetId,
}: PlanetCustomizerModalProps) {
  const [activePlanetId, setActivePlanetId] = useState<SpecialistId>("health");

  useEffect(() => {
    if (initialPlanetId && initialPlanetId !== "core") {
      setActivePlanetId(initialPlanetId);
    }
  }, [initialPlanetId]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cosmicAudio.playClick();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCustom: PlanetCustomization =
    customizations[activePlanetId] || DEFAULT_PLANET_CUSTOMIZATIONS[activePlanetId];

  const updateCurrent = (patch: Partial<PlanetCustomization>) => {
    const updated = { ...currentCustom, ...patch };
    onUpdateCustomization(activePlanetId, updated);
  };

  const handleResetCurrent = () => {
    cosmicAudio.playClick();
    const def = DEFAULT_PLANET_CUSTOMIZATIONS[activePlanetId];
    if (def) {
      onUpdateCustomization(activePlanetId, { ...def });
    }
  };

  const handleAddMoon = () => {
    cosmicAudio.playClick();
    if (currentCustom.moons.length >= 3) return;
    const count = currentCustom.moons.length + 1;
    const newMoon: CustomMoonConfig = {
      id: `m-${activePlanetId}-${Date.now()}`,
      name: `Moon ${count}`,
      size: 0.22,
      color: currentCustom.secondaryColor,
      distance: 2.1 + count * 0.6,
      speed: 1.0 + count * 0.2,
    };
    updateCurrent({ moons: [...currentCustom.moons, newMoon] });
  };

  const handleRemoveMoon = (moonId: string) => {
    cosmicAudio.playClick();
    updateCurrent({
      moons: currentCustom.moons.filter((m) => m.id !== moonId),
    });
  };

  const handleUpdateMoon = (moonId: string, patch: Partial<CustomMoonConfig>) => {
    updateCurrent({
      moons: currentCustom.moons.map((m) => (m.id === moonId ? { ...m, ...patch } : m)),
    });
  };

  const planetTabs = Object.values(SPECIALISTS).filter((s) => s.id !== "core");

  const archetypes: Array<{ id: PlanetArchetype; label: string; desc: string }> = [
    { id: "gas_giant", label: "Gas Giant", desc: "Sinusoidal atmospheric cloud bands" },
    { id: "rocky", label: "Rocky World", desc: "Cratered regolith with 3D elevation" },
    { id: "oceanic", label: "Oceanic Terra", desc: "Liquid oceans with continental plates" },
    { id: "volcanic", label: "Volcanic Magma", desc: "Basalt crust with glowing magma fissures" },
    { id: "ice_giant", label: "Ice Giant", desc: "Crystalline methane haze & polar frost" },
  ];

  const ringStyles: Array<{ id: RingStyle; label: string }> = [
    { id: "saturnian", label: "Saturnian Cassini" },
    { id: "ice", label: "Crystalline Ice" },
    { id: "meridian", label: "Orbital Meridian" },
    { id: "dust", label: "Cosmic Dust" },
  ];

  const colorPresets = [
    "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
    "#ec4899", "#f43f5e", "#ef4444", "#f97316", "#eab308",
    "#10b981", "#14b8a6", "#06b6d4", "#64748b", "#cbd5e1"
  ];

  return (
    <>
      {/* Ambient Backdrop Scrim */}
      <div
        onClick={() => {
          cosmicAudio.playClick();
          onClose();
        }}
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Main Studio Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Exoplanet Customization Studio"
        className="fixed inset-3 sm:inset-5 md:inset-8 z-50 max-w-5xl xl:max-w-6xl mx-auto my-auto h-[92vh] max-h-[900px] flex flex-col p-4 sm:p-5 md:p-6 bg-[#07080a]/94 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-zen-dock pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-250"
      >
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <SlidersHorizontal size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                Exoplanet Studio
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Customize surface archetypes, atmospheric palettes, rings, and moons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCurrent}
              title="Reset current planet to default"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition active:scale-[0.98]"
            >
              <ArrowCounterClockwise size={13} weight="bold" />
              <span>Reset Planet</span>
            </button>

            <button
              onClick={() => {
                cosmicAudio.playChime();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition active:scale-[0.98]"
            >
              <Check size={14} weight="bold" />
              <span>Apply to Cosmos</span>
            </button>

            <button
              onClick={() => {
                cosmicAudio.playClick();
                onClose();
              }}
              title="Close Studio"
              className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white backdrop-blur-xl flex items-center justify-center transition active:scale-[0.96]"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        </header>

        {/* Planet Navigation Strip */}
        <div className="flex items-center gap-1.5 pb-3 mb-4 overflow-x-auto border-b border-white/5 shrink-0">
          {planetTabs.map((p) => {
            const isTabActive = p.id === activePlanetId;
            const custom = customizations[p.id] || DEFAULT_PLANET_CUSTOMIZATIONS[p.id];
            return (
              <button
                key={p.id}
                onClick={() => {
                  cosmicAudio.playClick();
                  setActivePlanetId(p.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition active:scale-[0.98] whitespace-nowrap ${
                  isTabActive
                    ? "bg-zinc-800 text-white border border-amber-400/40 shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-white/5 hover:border-white/10"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: custom?.primaryColor || p.color }}
                />
                <span>{p.name.replace("Orbit ", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Workspace Interior: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
          {/* Left Column: Interactive 3D Real-time Preview */}
          <div className="lg:col-span-5 flex flex-col h-full bg-zinc-950/60 rounded-2xl border border-white/10 overflow-hidden relative group">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 backdrop-blur-md text-[10px] font-mono text-zinc-300">
              <Sparkle size={12} weight="fill" className="text-amber-400" />
              <span>Drag to rotate in 3D</span>
            </div>

            <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
              <Canvas camera={{ position: [0, 1.2, 5.5], fov: 45 }}>
                <CustomizerPreviewMesh custom={currentCustom} />
                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={3}
                  maxDistance={10}
                  dampingFactor={0.06}
                />
              </Canvas>
            </div>

            <div className="p-3 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>{SPECIALISTS[activePlanetId]?.name}</span>
              <span className="capitalize text-zinc-300">
                {currentCustom.archetype.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Right Column: Tactile Customization Controls */}
          <div className="lg:col-span-7 h-full overflow-y-auto pr-1 space-y-6">
            {/* 1. Surface Archetype Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-2">
                Surface Archetype
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {archetypes.map((arch) => {
                  const isSelected = currentCustom.archetype === arch.id;
                  return (
                    <button
                      key={arch.id}
                      onClick={() => {
                        cosmicAudio.playClick();
                        updateCurrent({ archetype: arch.id });
                      }}
                      className={`flex flex-col p-3 rounded-xl text-left border transition active:scale-[0.98] ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-400/60 text-white"
                          : "bg-zinc-900/50 border-white/5 hover:border-white/15 text-zinc-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{arch.label}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 leading-tight">
                        {arch.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Calibration */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Color Palette & Atmospheric Layers
              </label>

              {/* Primary Color */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300 font-medium">Primary Base Hue</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentCustom.primaryColor}
                      onChange={(e) => updateCurrent({ primaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {currentCustom.primaryColor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {colorPresets.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => updateCurrent({ primaryColor: hex })}
                      style={{ backgroundColor: hex }}
                      className="w-5 h-5 rounded-full shrink-0 border border-white/20 hover:scale-110 transition active:scale-95"
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300 font-medium">Secondary Band / Plate Hue</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentCustom.secondaryColor}
                      onChange={(e) => updateCurrent({ secondaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {currentCustom.secondaryColor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {colorPresets.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => updateCurrent({ secondaryColor: hex })}
                      style={{ backgroundColor: hex }}
                      className="w-5 h-5 rounded-full shrink-0 border border-white/20 hover:scale-110 transition active:scale-95"
                    />
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300 font-medium">Atmospheric Accent / Cloud Mist</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentCustom.accentColor}
                      onChange={(e) => updateCurrent({ accentColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {currentCustom.accentColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bump Scale & Roughness Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                  <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                    <span>Elevation Relief</span>
                    <span className="font-mono text-amber-400">
                      {Math.round(currentCustom.bumpScale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.02"
                    value={currentCustom.bumpScale}
                    onChange={(e) => updateCurrent({ bumpScale: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                  <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                    <span>Surface Roughness</span>
                    <span className="font-mono text-amber-400">
                      {Math.round(currentCustom.roughness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.85"
                    step="0.05"
                    value={currentCustom.roughness}
                    onChange={(e) => updateCurrent({ roughness: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Planetary Rings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Planetary Ring System
                </label>
                <button
                  onClick={() => {
                    cosmicAudio.playClick();
                    updateCurrent({
                      hasRings: !currentCustom.hasRings,
                      ringStyle: !currentCustom.hasRings && currentCustom.ringStyle === "none" ? "saturnian" : currentCustom.ringStyle,
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                    currentCustom.hasRings
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-white/10"
                  }`}
                >
                  {currentCustom.hasRings ? "Rings Enabled" : "Rings Disabled"}
                </button>
              </div>

              {currentCustom.hasRings && (
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 space-y-4 animate-in fade-in duration-200">
                  {/* Ring Style */}
                  <div>
                    <span className="block text-xs text-zinc-400 mb-2">Ring Pattern Style</span>
                    <div className="grid grid-cols-2 gap-2">
                      {ringStyles.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => updateCurrent({ ringStyle: r.id })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                            currentCustom.ringStyle === r.id
                              ? "bg-amber-500/10 border-amber-400/60 text-white"
                              : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ring Color & Tilt */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-white/5">
                      <span className="text-xs text-zinc-300">Ring Tint</span>
                      <input
                        type="color"
                        value={currentCustom.ringColor}
                        onChange={(e) => updateCurrent({ ringColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5">
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span>Ring Tilt</span>
                        <span className="font-mono text-amber-400">
                          {Math.round(currentCustom.ringTilt * 100)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.05"
                        value={currentCustom.ringTilt}
                        onChange={(e) => updateCurrent({ ringTilt: parseFloat(e.target.value) })}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Satellite Moons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider block">
                    Satellite Moons ({currentCustom.moons.length} / 3)
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Add orbiting natural satellites to this planet
                  </span>
                </div>
                {currentCustom.moons.length < 3 && (
                  <button
                    onClick={handleAddMoon}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/10 transition active:scale-[0.98]"
                  >
                    <Plus size={13} weight="bold" />
                    <span>Add Moon</span>
                  </button>
                )}
              </div>

              {currentCustom.moons.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5 text-center text-xs text-zinc-500">
                  No moons orbiting this planet. Click "Add Moon" above to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentCustom.moons.map((moon, index) => (
                    <div
                      key={moon.id}
                      className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: moon.color }}
                          />
                          <input
                            type="text"
                            value={moon.name}
                            onChange={(e) => handleUpdateMoon(moon.id, { name: e.target.value })}
                            className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none border-b border-transparent focus:border-amber-400/40"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveMoon(moon.id)}
                          title="Remove Moon"
                          className="text-zinc-500 hover:text-red-400 transition"
                        >
                          <Trash size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block mb-1">Color</span>
                          <input
                            type="color"
                            value={moon.color}
                            onChange={(e) => handleUpdateMoon(moon.id, { color: e.target.value })}
                            className="w-full h-7 rounded cursor-pointer bg-zinc-950 border border-white/10 p-0.5"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                            <span>Distance</span>
                            <span className="font-mono">{moon.distance.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min="1.6"
                            max="4.0"
                            step="0.2"
                            value={moon.distance}
                            onChange={(e) =>
                              handleUpdateMoon(moon.id, { distance: parseFloat(e.target.value) })
                            }
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                            <span>Speed</span>
                            <span className="font-mono">{moon.speed.toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.4"
                            max="2.5"
                            step="0.1"
                            value={moon.speed}
                            onChange={(e) =>
                              handleUpdateMoon(moon.id, { speed: parseFloat(e.target.value) })
                            }
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
