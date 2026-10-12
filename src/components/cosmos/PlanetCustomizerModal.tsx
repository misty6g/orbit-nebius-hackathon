"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
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
  normalizePlanetCustomization,
  NebulaCustomization,
  DEFAULT_NEBULA_CUSTOMIZATION,
  NEBULA_COLOR_PRESETS,
} from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { generateExoplanetTextures, generateExoplanetRingTexture } from "@/lib/exoplanetTextures";
import {
  createNightFillMaterial,
  createDayBoostMaterial,
  NIGHT_FLOOR,
} from "@/lib/softPlanetLighting";
import {
  X,
  Plus,
  Trash,
  ArrowCounterClockwise,
  Check,
  Sparkle,
  SlidersHorizontal,
  Cloud,
  Drop,
  Mountains,
} from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface PlanetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customizations: Record<string, PlanetCustomization>;
  onUpdateCustomization: (id: SpecialistId, updated: PlanetCustomization) => void;
  onResetAll: () => void;
  initialPlanetId?: SpecialistId | null;
  nebulaCustomization?: NebulaCustomization;
  onUpdateNebula?: (updated: NebulaCustomization) => void;
}

/** Live preview uses the same soft-lit dual-layer path as the cosmos. */
function CustomizerPreviewMesh({
  custom,
  planetId,
}: {
  custom: PlanetCustomization;
  planetId: SpecialistId;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dayBoostRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<Array<THREE.Group | null>>([]);
  const moonAngles = useRef<number[]>([0, 2, 4]);

  const textures = useMemo(() => generateExoplanetTextures(custom), [custom]);

  const nightFillMaterial = useMemo(
    () => createNightFillMaterial(textures.colorMap, NIGHT_FLOOR),
    [textures.colorMap]
  );
  const dayBoostMaterial = useMemo(
    () => createDayBoostMaterial(textures.colorMap, NIGHT_FLOOR),
    [textures.colorMap]
  );

  useEffect(() => {
    return () => {
      nightFillMaterial.dispose();
      dayBoostMaterial.dispose();
    };
  }, [nightFillMaterial, dayBoostMaterial]);

  const ringTexture = useMemo(() => {
    if (custom.hasRings && custom.ringStyle !== "none") {
      return generateExoplanetRingTexture(custom.ringStyle, custom.ringColor);
    }
    return null;
  }, [custom.hasRings, custom.ringStyle, custom.ringColor]);

  const moonTextures = useMemo(
    () =>
      custom.moons.map((moon) =>
        generateExoplanetTextures({
          id: planetId,
          archetype: "rocky",
          primaryColor: new THREE.Color(moon.color).multiplyScalar(0.5).getStyle(),
          secondaryColor: moon.color,
          accentColor: "#d0c8bc",
          bumpScale: 0.08,
          roughness: 0.95,
          atmosphereIntensity: 0.1,
          cloudCover: 0,
          chromaMute: 0.5,
          hasRings: false,
          ringStyle: "none",
          ringColor: moon.color,
          ringTilt: 0,
          moons: [],
        })
      ),
    [custom.moons, planetId]
  );

  const atmoIntensity = custom.atmosphereIntensity ?? 0.45;

  const fresnelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        uniform vec3 uColor;
        uniform float uIntensity;
        void main() {
          vec3 lightDir = normalize(vec3(4.0, 3.0, 5.0));
          vec3 N = normalize(vNormalW);
          float lit = smoothstep(-0.1, 0.75, dot(N, lightDir));
          vec3 V = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - abs(dot(V, N)), 2.6);
          float a = fresnel * (0.12 + 0.75 * lit) * uIntensity;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(custom.secondaryColor) },
        uIntensity: { value: 0.3 + atmoIntensity * 0.5 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cloudMap = useMemo(() => {
    const cover = custom.cloudCover ?? 0;
    if (cover < 0.05 || typeof window === "undefined") return null;
    const w = 512;
    const h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const tint = new THREE.Color(custom.accentColor);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const n =
          Math.sin(u * 12 + v * 6) * 0.5 + Math.sin(u * 28 - v * 14) * 0.25;
        const a = Math.max(0, Math.min(1, (n + 0.3) * 0.45 * cover));
        const i = (y * w + x) * 4;
        d[i] = Math.round(tint.r * 255);
        d[i + 1] = Math.round(tint.g * 255);
        d[i + 2] = Math.round(tint.b * 255);
        d[i + 3] = Math.round(a * 140);
      }
    }
    ctx.putImageData(img, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [custom.cloudCover, custom.accentColor]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.32;
      if (dayBoostRef.current) {
        dayBoostRef.current.rotation.copy(meshRef.current.rotation);
      }
    }
    const tint = new THREE.Color(custom.secondaryColor)
      .lerp(new THREE.Color("#7ab8b4"), 0.35)
      .lerp(new THREE.Color("#d4b890"), 0.1);
    fresnelMaterial.uniforms.uColor.value.copy(tint);
    fresnelMaterial.uniforms.uIntensity.value = 0.3 + atmoIntensity * 0.5;

    custom.moons.forEach((moon, idx) => {
      if (!moonAngles.current[idx]) moonAngles.current[idx] = 0;
      moonAngles.current[idx] += delta * moon.speed * 0.9;
      const el = moonRefs.current[idx];
      if (el) {
        const mx = Math.cos(moonAngles.current[idx]) * (1.8 * moon.distance * 0.85);
        const mz = Math.sin(moonAngles.current[idx]) * (1.8 * moon.distance * 0.85);
        el.position.set(mx, 0, mz);
      }
    });
  });

  return (
    <group>
      {/* Soft key + fill matching cosmos night≈0.7× day */}
      <ambientLight intensity={0.22} color="#6a7a98" />
      <directionalLight position={[4, 3, 5]} intensity={0.35} color="#ffe9c4" />
      <directionalLight position={[-4, 1, -3]} intensity={0.2} color="#93c5fd" />

      <mesh ref={meshRef} material={nightFillMaterial}>
        <sphereGeometry args={[1.7, 72, 72]} />
      </mesh>
      <mesh ref={dayBoostRef} material={dayBoostMaterial} raycast={() => null}>
        <sphereGeometry args={[1.702, 72, 72]} />
      </mesh>

      {cloudMap && (
        <mesh raycast={() => null}>
          <sphereGeometry args={[1.72, 48, 48]} />
          <meshBasicMaterial
            map={cloudMap}
            transparent
            opacity={0.12 + (custom.cloudCover ?? 0) * 0.14}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      <mesh material={fresnelMaterial} raycast={() => null}>
        <sphereGeometry args={[1.76, 40, 40]} />
      </mesh>

      {custom.hasRings && ringTexture && (
        <mesh rotation={[-Math.PI / 3.2, custom.ringTilt, 0]}>
          <ringGeometry args={[2.2, 3.8, 96]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.78}
            roughness={0.7}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}

      {custom.moons.map((moon, idx) => (
        <group
          key={moon.id || idx}
          ref={(el) => {
            moonRefs.current[idx] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[moon.size * 1.2, 24, 24]} />
            <meshBasicMaterial
              map={moonTextures[idx]?.colorMap}
              color="#c4c0b8"
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const ZEN_SWATCHES = [
  "#2e3238", "#3a3f48", "#4a3a28", "#6b3a28", "#8a6a40",
  "#a06038", "#c9a078", "#2a4a4e", "#4a6b52", "#2a3550",
  "#4a5a78", "#4a5e6c", "#7a8e9a", "#5a5248", "#8a8070",
];

export function PlanetCustomizerModal({
  isOpen,
  onClose,
  customizations,
  onUpdateCustomization,
  onResetAll,
  initialPlanetId,
  nebulaCustomization = DEFAULT_NEBULA_CUSTOMIZATION,
  onUpdateNebula,
}: PlanetCustomizerModalProps) {
  const [activePlanetId, setActivePlanetId] = useState<SpecialistId>("health");
  const [studioMode, setStudioMode] = useState<"planet" | "background">("planet");

  useEffect(() => {
    if (initialPlanetId && initialPlanetId !== "core") {
      setActivePlanetId(initialPlanetId);
      setStudioMode("planet");
    }
  }, [initialPlanetId]);

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

  const fallback =
    DEFAULT_PLANET_CUSTOMIZATIONS[activePlanetId] || DEFAULT_PLANET_CUSTOMIZATIONS.health;
  const currentCustom = normalizePlanetCustomization(
    customizations[activePlanetId],
    fallback
  );

  const updateCurrent = (patch: Partial<PlanetCustomization>) => {
    onUpdateCustomization(activePlanetId, { ...currentCustom, ...patch });
  };

  const handleResetCurrent = () => {
    cosmicAudio.playClick();
    if (studioMode === "background") {
      onUpdateNebula?.({ ...DEFAULT_NEBULA_CUSTOMIZATION });
      return;
    }
    const def = DEFAULT_PLANET_CUSTOMIZATIONS[activePlanetId];
    if (def) onUpdateCustomization(activePlanetId, { ...def });
  };

  const updateNebula = (patch: Partial<NebulaCustomization>) => {
    onUpdateNebula?.({ ...nebulaCustomization, ...patch });
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
    updateCurrent({ moons: currentCustom.moons.filter((m) => m.id !== moonId) });
  };

  const handleUpdateMoon = (moonId: string, patch: Partial<CustomMoonConfig>) => {
    updateCurrent({
      moons: currentCustom.moons.map((m) => (m.id === moonId ? { ...m, ...patch } : m)),
    });
  };

  const planetTabs = Object.values(SPECIALISTS).filter((s) => s.id !== "core");

  const archetypes: Array<{ id: PlanetArchetype; label: string; desc: string }> = [
    { id: "rocky", label: "Rocky", desc: "Cratered regolith · soft maria" },
    { id: "oceanic", label: "Oceanic", desc: "Deep seas · mossy continents" },
    { id: "gas_giant", label: "Gas Giant", desc: "Soft bands · muted storms" },
    { id: "ice_giant", label: "Ice Giant", desc: "Frost haze · pale ridges" },
    { id: "volcanic", label: "Volcanic", desc: "Basalt · restrained embers" },
  ];

  const ringStyles: Array<{ id: RingStyle; label: string }> = [
    { id: "saturnian", label: "Cassini bands" },
    { id: "ice", label: "Ice shimmer" },
    { id: "meridian", label: "Thin meridian" },
    { id: "dust", label: "Dust veil" },
  ];

  return (
    <>
      <div
        onClick={() => {
          cosmicAudio.playClick();
          onClose();
        }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Planet Studio"
        className="fixed inset-3 sm:inset-5 md:inset-8 z-50 max-w-5xl xl:max-w-6xl mx-auto my-auto h-[92vh] max-h-[900px] flex flex-col p-4 sm:p-5 md:p-6 bg-[rgba(8,9,14,0.94)] backdrop-blur-2xl rounded-2xl border border-white/8 shadow-zen-dock pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-250"
      >
        <header className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-300">
              <SlidersHorizontal size={16} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
                Planet Studio
              </h2>
              <p className="text-[11px] font-mono text-zinc-500">
                {studioMode === "background"
                  ? "Indigo / space-blue nebula tint"
                  : "Soft-lit exoplanet look · every control drives the surface"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-zinc-300 border border-white/8 text-xs font-mono transition active:scale-[0.98]"
            >
              <ArrowCounterClockwise size={13} weight="bold" />
              <span>{studioMode === "background" ? "Reset Sky" : "Reset Planet"}</span>
            </button>
            <button
              onClick={() => {
                cosmicAudio.playChime();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-400/90 hover:bg-sky-300 text-zinc-950 font-semibold text-xs transition active:scale-[0.98]"
            >
              <Check size={14} weight="bold" />
              <span>Done</span>
            </button>
            <button
              onClick={() => {
                cosmicAudio.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 text-zinc-400 hover:text-white flex items-center justify-center transition active:scale-[0.96]"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        </header>

        <div className="flex items-center gap-1.5 pb-3 mb-4 overflow-x-auto border-b border-white/5 shrink-0">
          <button
            onClick={() => {
              cosmicAudio.playClick();
              setStudioMode("background");
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition active:scale-[0.98] whitespace-nowrap ${
              studioMode === "background"
                ? "bg-white/[0.08] text-white border border-sky-400/35"
                : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/5"
            }`}
          >
            <Cloud size={13} weight="bold" className="text-sky-400" />
            <span>Background</span>
          </button>
          <span className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />
          {planetTabs.map((p) => {
            const isTabActive = studioMode === "planet" && p.id === activePlanetId;
            const custom =
              customizations[p.id] || DEFAULT_PLANET_CUSTOMIZATIONS[p.id];
            return (
              <button
                key={p.id}
                onClick={() => {
                  cosmicAudio.playClick();
                  setStudioMode("planet");
                  setActivePlanetId(p.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition active:scale-[0.98] whitespace-nowrap ${
                  isTabActive
                    ? "bg-white/[0.08] text-white border border-sky-400/35"
                    : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/5"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: custom?.primaryColor || p.color }}
                />
                <span>{p.name.replace("Orbit ", "")}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
          <div className="lg:col-span-5 flex flex-col h-full bg-[#06070c] rounded-2xl border border-white/8 overflow-hidden relative">
            {studioMode === "background" ? (
              <>
                <div
                  className="flex-1 w-full relative"
                  style={{
                    background: `radial-gradient(ellipse at 30% 40%, ${nebulaCustomization.leftColor}cc 0%, transparent 55%),
                      radial-gradient(ellipse at 75% 45%, ${nebulaCustomization.rightColor}cc 0%, transparent 50%),
                      linear-gradient(90deg, ${nebulaCustomization.leftColor}66, ${nebulaCustomization.deepColor}, ${nebulaCustomization.rightColor}66),
                      ${nebulaCustomization.deepColor}`,
                  }}
                >
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/50 border border-white/8 text-[10px] font-mono text-zinc-300">
                    <Cloud size={12} weight="fill" className="text-sky-400" />
                    <span>Nebula preview</span>
                  </div>
                </div>
                <div className="p-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>Cosmos Background</span>
                  <span className="text-zinc-400">Left · Deep · Right</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/50 border border-white/8 text-[10px] font-mono text-zinc-300">
                  <Sparkle size={12} weight="fill" className="text-sky-300" />
                  <span>Soft-lit preview · drag to rotate</span>
                </div>
                <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
                  <Canvas
                    camera={{ position: [0, 1.1, 5.4], fov: 42 }}
                    gl={{ toneMapping: THREE.NoToneMapping, toneMappingExposure: 1 }}
                  >
                    <color attach="background" args={["#06070c"]} />
                    <Suspense fallback={null}>
                      <CustomizerPreviewMesh
                        custom={currentCustom}
                        planetId={activePlanetId}
                      />
                    </Suspense>
                    <OrbitControls
                      enablePan={false}
                      enableZoom
                      minDistance={3}
                      maxDistance={10}
                      dampingFactor={0.06}
                    />
                  </Canvas>
                </div>
                <div className="p-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>{SPECIALISTS[activePlanetId]?.name}</span>
                  <span className="capitalize text-zinc-400">
                    {currentCustom.archetype.replace("_", " ")} · night {Math.round(NIGHT_FLOOR * 100)}%
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-7 h-full overflow-y-auto pr-1 space-y-5">
            {studioMode === "background" ? (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Nebula Presets
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {NEBULA_COLOR_PRESETS.map((preset) => {
                      const isSelected =
                        nebulaCustomization.leftColor === preset.colors.leftColor &&
                        nebulaCustomization.rightColor === preset.colors.rightColor &&
                        nebulaCustomization.deepColor === preset.colors.deepColor;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            cosmicAudio.playClick();
                            onUpdateNebula?.({ ...preset.colors });
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl text-left border transition active:scale-[0.98] ${
                            isSelected
                              ? "bg-sky-500/10 border-sky-400/50 text-white"
                              : "bg-white/[0.03] border-white/5 hover:border-white/12 text-zinc-300"
                          }`}
                        >
                          <span
                            className="w-10 h-10 rounded-lg border border-white/10 shrink-0"
                            style={{
                              background: `linear-gradient(90deg, ${preset.colors.leftColor}, ${preset.colors.deepColor} 50%, ${preset.colors.rightColor})`,
                            }}
                          />
                          <span className="text-xs font-semibold">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {(
                  [
                    { key: "leftColor" as const, label: "Left volume" },
                    { key: "rightColor" as const, label: "Right volume" },
                    { key: "deepColor" as const, label: "Deep wash" },
                  ] as const
                ).map((field) => (
                  <div key={field.key} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-zinc-300 font-medium">{field.label}</label>
                      <input
                        type="color"
                        value={nebulaCustomization[field.key]}
                        onChange={(e) => updateNebula({ [field.key]: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    World Type
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
                              ? "bg-sky-500/10 border-sky-400/50 text-white"
                              : "bg-white/[0.03] border-white/5 hover:border-white/12 text-zinc-300"
                          }`}
                        >
                          <span className="text-xs font-semibold mb-0.5">{arch.label}</span>
                          <span className="text-[11px] text-zinc-500">{arch.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    Surface Palette
                  </label>
                  {(
                    [
                      { key: "primaryColor" as const, label: "Basins / lows", hint: "Oceans, maria, band lows" },
                      { key: "secondaryColor" as const, label: "Highlands / plates", hint: "Continents, mid bands" },
                      { key: "accentColor" as const, label: "Dust / frost / mist", hint: "Clouds, caps, storm haze" },
                    ] as const
                  ).map((field) => (
                    <div
                      key={field.key}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-zinc-200 font-medium">{field.label}</span>
                          <span className="block text-[10px] font-mono text-zinc-500">{field.hint}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentCustom[field.key]}
                            onChange={(e) => updateCurrent({ [field.key]: e.target.value })}
                            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] font-mono text-zinc-500 uppercase w-16">
                            {currentCustom[field.key]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ZEN_SWATCHES.map((hex) => (
                          <button
                            key={`${field.key}-${hex}`}
                            onClick={() => {
                              cosmicAudio.playClick();
                              updateCurrent({ [field.key]: hex });
                            }}
                            style={{ backgroundColor: hex }}
                            className={`w-5 h-5 rounded-full shrink-0 border transition active:scale-95 ${
                              currentCustom[field.key].toLowerCase() === hex
                                ? "border-sky-300 ring-2 ring-sky-400/35"
                                : "border-white/15 hover:border-white/35"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Soft Material
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Mountains size={12} className="text-zinc-500" />
                          Relief
                        </span>
                        <span className="font-mono text-sky-300">
                          {Math.round(currentCustom.bumpScale * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.45"
                        step="0.02"
                        value={currentCustom.bumpScale}
                        onChange={(e) =>
                          updateCurrent({ bumpScale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                        Baked into albedo contrast
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                        <span>Matte softness</span>
                        <span className="font-mono text-sky-300">
                          {Math.round(currentCustom.roughness * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.35"
                        max="1"
                        step="0.02"
                        value={currentCustom.roughness}
                        onChange={(e) =>
                          updateCurrent({ roughness: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                        Higher = softer tonal grain
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Drop size={12} className="text-zinc-500" />
                          Limb mist
                        </span>
                        <span className="font-mono text-sky-300">
                          {Math.round((currentCustom.atmosphereIntensity ?? 0.45) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={currentCustom.atmosphereIntensity ?? 0.45}
                        onChange={(e) =>
                          updateCurrent({
                            atmosphereIntensity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Cloud size={12} className="text-zinc-500" />
                          Cloud veil
                        </span>
                        <span className="font-mono text-sky-300">
                          {Math.round((currentCustom.cloudCover ?? 0.2) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={currentCustom.cloudCover ?? 0.2}
                        onChange={(e) =>
                          updateCurrent({ cloudCover: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 sm:col-span-2">
                      <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                        <span>Chroma mute (Zen)</span>
                        <span className="font-mono text-sky-300">
                          {Math.round((currentCustom.chromaMute ?? 0.4) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.85"
                        step="0.05"
                        value={currentCustom.chromaMute ?? 0.4}
                        onChange={(e) =>
                          updateCurrent({ chromaMute: parseFloat(e.target.value) })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-600 mt-1 font-mono">
                        Desaturates toward soft cinematic earth tones
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                      Rings
                    </label>
                    <button
                      onClick={() => {
                        cosmicAudio.playClick();
                        updateCurrent({
                          hasRings: !currentCustom.hasRings,
                          ringStyle:
                            !currentCustom.hasRings && currentCustom.ringStyle === "none"
                              ? "saturnian"
                              : currentCustom.ringStyle,
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition ${
                        currentCustom.hasRings
                          ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                          : "bg-white/[0.04] text-zinc-500 border border-white/8"
                      }`}
                    >
                      {currentCustom.hasRings ? "On" : "Off"}
                    </button>
                  </div>
                  {currentCustom.hasRings && (
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {ringStyles.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => updateCurrent({ ringStyle: r.id })}
                            className={`px-3 py-2 rounded-lg text-xs text-left border transition ${
                              currentCustom.ringStyle === r.id
                                ? "bg-sky-500/10 border-sky-400/50 text-white"
                                : "bg-transparent border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                          <span className="text-xs text-zinc-400">Tint</span>
                          <input
                            type="color"
                            value={currentCustom.ringColor}
                            onChange={(e) => updateCurrent({ ringColor: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                          <div className="flex justify-between text-xs text-zinc-400 mb-1">
                            <span>Tilt</span>
                            <span className="font-mono text-sky-300">
                              {Math.round(currentCustom.ringTilt * 100)}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="0.8"
                            step="0.05"
                            value={currentCustom.ringTilt}
                            onChange={(e) =>
                              updateCurrent({ ringTilt: parseFloat(e.target.value) })
                            }
                            className="w-full accent-sky-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                        Moons ({currentCustom.moons.length}/3)
                      </label>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        Soft rocky satellites
                      </span>
                    </div>
                    {currentCustom.moons.length < 3 && (
                      <button
                        onClick={handleAddMoon}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 text-xs border border-white/8 transition active:scale-[0.98]"
                      >
                        <Plus size={13} weight="bold" />
                        Add
                      </button>
                    )}
                  </div>
                  {currentCustom.moons.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-zinc-600">
                      No moons yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentCustom.moons.map((moon) => (
                        <div
                          key={moon.id}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: moon.color }}
                              />
                              <input
                                type="text"
                                value={moon.name}
                                onChange={(e) =>
                                  handleUpdateMoon(moon.id, { name: e.target.value })
                                }
                                className="bg-transparent text-xs text-zinc-200 focus:outline-none border-b border-transparent focus:border-sky-400/40"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveMoon(moon.id)}
                              className="text-zinc-600 hover:text-red-400 transition"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-zinc-500 block mb-1">Color</span>
                              <input
                                type="color"
                                value={moon.color}
                                onChange={(e) =>
                                  handleUpdateMoon(moon.id, { color: e.target.value })
                                }
                                className="w-full h-7 rounded cursor-pointer bg-black/40 border border-white/8 p-0.5"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                                <span>Dist</span>
                                <span className="font-mono">{moon.distance.toFixed(1)}</span>
                              </div>
                              <input
                                type="range"
                                min="1.6"
                                max="4"
                                step="0.2"
                                value={moon.distance}
                                onChange={(e) =>
                                  handleUpdateMoon(moon.id, {
                                    distance: parseFloat(e.target.value),
                                  })
                                }
                                className="w-full accent-sky-400 cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
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
                                  handleUpdateMoon(moon.id, {
                                    speed: parseFloat(e.target.value),
                                  })
                                }
                                className="w-full accent-sky-400 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
