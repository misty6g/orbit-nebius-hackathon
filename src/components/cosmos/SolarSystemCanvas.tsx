"use client";

import React, { useState, useCallback, useMemo, useRef, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  SpecialistId,
  PlanetCustomization,
  NebulaCustomization,
  DEFAULT_NEBULA_CUSTOMIZATION,
  DEFAULT_PLANET_CUSTOMIZATIONS,
} from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { StarryBackground } from "./StarryBackground";
import { NebulaField } from "./NebulaField";
import { SunCore } from "./SunCore";
import { AlienPlanet } from "./AlienPlanet";
import { OrbitPaths } from "./OrbitPaths";
import { GravitationalBeams } from "./GravitationalBeams";
import { CameraChoreographer } from "./CameraChoreographer";
import { PlanetScreenTracker, OffScreenIndicatorsOverlay } from "./OffScreenPlanetIndicators";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

interface SolarSystemCanvasProps {
  selectedSpecialistId: SpecialistId | null;
  onSelectSpecialist: (id: SpecialistId) => void;
  onDeselect: () => void;
  activeConstellationTargets?: SpecialistId[];
  isTouring?: boolean;
  tourStep?: number;
  planetCustomizations?: Record<string, PlanetCustomization>;
  nebulaCustomization?: NebulaCustomization;
}

function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export function SolarSystemCanvas({
  selectedSpecialistId,
  onSelectSpecialist,
  onDeselect,
  activeConstellationTargets = [],
  isTouring = false,
  tourStep = 0,
  planetCustomizations = {},
  nebulaCustomization = DEFAULT_NEBULA_CUSTOMIZATION,
}: SolarSystemCanvasProps) {
  const [planetPositions, setPlanetPositions] = useState<Record<string, THREE.Vector3>>({});
  const planetPositionsRef = useRef<Record<string, THREE.Vector3>>({});
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  /** Stagger planet mounts so procedural textures never block one giant longtask. */
  const [visiblePlanetCount, setVisiblePlanetCount] = useState(0);

  useEffect(() => {
    setWebglOk(supportsWebGL());
    // Defer GL mount one frame so layout + localStorage bootstrap settle first.
    const id = window.requestAnimationFrame(() => setCanvasReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!canvasReady || !webglOk) return;
    let cancelled = false;
    let count = 0;
    const total = Object.values(SPECIALISTS).filter(
      (s) => s.id !== "core" && !s.parentPlanetId && s.id !== "deals" && s.id !== "build"
    ).length;

    const pump = () => {
      if (cancelled) return;
      count = Math.min(total, count + 1);
      setVisiblePlanetCount(count);
      if (count < total) {
        window.requestAnimationFrame(pump);
      }
    };
    const id = window.requestAnimationFrame(pump);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
    };
  }, [canvasReady, webglOk]);

  const handlePositionUpdate = useCallback((id: SpecialistId, pos: THREE.Vector3) => {
    planetPositionsRef.current[id] = pos.clone();

    setPlanetPositions((prev) => {
      const current = prev[id];
      if (current && current.distanceToSquared(pos) < 0.05) {
        return prev;
      }
      return { ...prev, [id]: pos.clone() };
    });
  }, []);

  const planets = useMemo(() => {
    return Object.values(SPECIALISTS).filter(
      (s) => s.id !== "core" && !s.parentPlanetId && s.id !== "deals" && s.id !== "build"
    );
  }, []);

  const allowManualOrbit = !selectedSpecialistId && !isTouring;
  const deepBg = nebulaCustomization.deepColor || DEFAULT_NEBULA_CUSTOMIZATION.deepColor;

  if (webglOk === false) {
    return (
      <div className="absolute inset-0" style={{ backgroundColor: deepBg }}>
        <WebGLFallbackUI onSelectSpecialist={onSelectSpecialist} />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full absolute inset-0 overflow-hidden"
      style={{ backgroundColor: deepBg }}
    >
      {webglOk && canvasReady && (
        <WebGLErrorBoundary onSelectSpecialist={onSelectSpecialist}>
          <Canvas
            camera={{ position: [0, 12, 22], fov: 40, near: 0.1, far: 1500 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              alpha: false,
              // "default" is more reliable across integrated GPUs than high-performance.
              powerPreference: "default",
              failIfMajorPerformanceCaveat: false,
              toneMapping: THREE.NoToneMapping,
              toneMappingExposure: 1,
            }}
            onCreated={({ gl }) => {
              const canvas = gl.domElement;
              const onLost = (e: Event) => {
                e.preventDefault();
                console.warn("Orbit WebGL context lost");
                setWebglOk(false);
              };
              canvas.addEventListener("webglcontextlost", onLost, false);
            }}
            onPointerMissed={() => {
              if (selectedSpecialistId && !isTouring) {
                onDeselect();
              }
            }}
          >
            <color attach="background" args={[deepBg]} />
            <fogExp2 attach="fog" args={[deepBg, 0.0035]} />

            <ambientLight intensity={0.5} color="#6a7a98" />
            <hemisphereLight args={["#5a6f90", "#1c1430", 0.45]} />
            <directionalLight position={[18, 22, 28]} intensity={0.2} color="#8aa0c0" />
            <directionalLight position={[-24, 8, -16]} intensity={0.18} color="#6b5a88" />

            {/* Nebula never suspends the whole scene */}
            <NebulaField colors={nebulaCustomization} />
            <StarryBackground />
            <OrbitPaths />

            <Suspense fallback={null}>
              <SunCore
                onSelect={() => onSelectSpecialist("core")}
                isSelected={selectedSpecialistId === "core"}
              />

              {planets.slice(0, visiblePlanetCount).map((spec, index) => {
                const studio =
                  planetCustomizations[spec.id] || DEFAULT_PLANET_CUSTOMIZATIONS[spec.id];
                const archetype = studio?.archetype;
                const hasClouds =
                  archetype === "oceanic" ||
                  archetype === "ice_giant" ||
                  spec.id === "travel" ||
                  spec.id === "move";

                return (
                  <AlienPlanet
                    key={spec.id}
                    config={spec}
                    initialAngle={(index * 2.3999632) % (Math.PI * 2)}
                    onSelect={onSelectSpecialist}
                    isSelected={selectedSpecialistId === spec.id}
                    onPositionUpdate={handlePositionUpdate}
                    customization={planetCustomizations[spec.id]}
                    size={spec.id === "move" ? Math.max(spec.size, 1.15) : undefined}
                    archetype={archetype}
                    hasClouds={hasClouds}
                    atmosphereColor={studio?.secondaryColor}
                    bumpScale={studio?.bumpScale}
                    roughness={studio?.roughness}
                    palette={
                      studio
                        ? {
                            primary: studio.primaryColor,
                            secondary: studio.secondaryColor,
                            accent: studio.accentColor,
                            atmosphere: studio.secondaryColor,
                          }
                        : undefined
                    }
                  />
                );
              })}

              <PlanetScreenTracker
                selectedSpecialistId={selectedSpecialistId}
                planetPositionsRef={planetPositionsRef}
                overlayContainerRef={overlayContainerRef}
              />
            </Suspense>

            <GravitationalBeams
              activeTargets={activeConstellationTargets}
              planetPositions={planetPositions}
            />

            <CameraChoreographer
              selectedSpecialistId={selectedSpecialistId}
              planetPositions={planetPositions}
              isTouring={isTouring}
              tourStep={tourStep}
            />

            <OrbitControls
              makeDefault
              enabled={allowManualOrbit}
              enablePan={false}
              enableZoom={true}
              minDistance={8}
              maxDistance={90}
              maxPolarAngle={Math.PI / 2 + 0.15}
              minPolarAngle={Math.PI / 16}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
              dampingFactor={0.05}
            />
          </Canvas>
        </WebGLErrorBoundary>
      )}

      <OffScreenIndicatorsOverlay
        containerRef={overlayContainerRef}
        onSelectSpecialist={onSelectSpecialist}
      />
    </div>
  );
}

function WebGLFallbackUI({
  onSelectSpecialist,
}: {
  onSelectSpecialist: (id: SpecialistId) => void;
}) {
  const planets = Object.values(SPECIALISTS).filter((s) => !s.parentPlanetId);
  return (
    <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-6 px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, #243056 0%, #0c101c 52%, #050608 100%)",
        }}
      />
      <div className="relative z-10 max-w-md text-center space-y-2">
        <p className="text-sm font-semibold text-zinc-100">WebGL unavailable</p>
        <p className="text-xs font-mono text-zinc-400">
          Open a specialist from the list or the bottom dock.
        </p>
      </div>
      <div className="relative z-10 flex flex-wrap justify-center gap-2 max-w-lg">
        {planets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectSpecialist(p.id)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
