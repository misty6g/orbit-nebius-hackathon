"use client";

import React, { useState, useCallback, useMemo, useRef, Suspense } from "react";
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

  const handlePositionUpdate = useCallback((id: SpecialistId, pos: THREE.Vector3) => {
    // Keep continuous 60fps ref updated for off-screen screen tracker
    planetPositionsRef.current[id] = pos.clone();

    setPlanetPositions((prev) => {
      const current = prev[id];
      if (current && current.distanceToSquared(pos) < 0.05) {
        return prev;
      }
      return { ...prev, [id]: pos.clone() };
    });
  }, []);

  // Filter regular planets (exclude center Sun Core and child moonlets handled by their parents)
  const planets = useMemo(() => {
    return Object.values(SPECIALISTS).filter(
      (s) => s.id !== "core" && !s.parentPlanetId && s.id !== "deals" && s.id !== "build"
    );
  }, []);

  const allowManualOrbit = !selectedSpecialistId && !isTouring;

  const deepBg = nebulaCustomization.deepColor || DEFAULT_NEBULA_CUSTOMIZATION.deepColor;

  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden" style={{ backgroundColor: deepBg }}>
      <Canvas
        camera={{ position: [0, 12, 22], fov: 40, near: 0.1, far: 1500 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          // No ACES — was crushing soft night fill + nebula washes to near-black
          toneMapping: THREE.NoToneMapping,
          toneMappingExposure: 1,
        }}
        onPointerMissed={() => {
          if (selectedSpecialistId && !isTouring) {
            onDeselect();
          }
        }}
      >
        <color attach="background" args={[deepBg]} />
        {/* Fog tint follows the user deep/wash color */}
        <fogExp2 attach="fog" args={[deepBg, 0.0035]} />

        {/* Cool fill supports softLit wrap (night ≈ 0.7× day) */}
        <ambientLight intensity={0.5} color="#6a7a98" />
        <hemisphereLight args={["#5a6f90", "#1c1430", 0.45]} />
        <directionalLight position={[18, 22, 28]} intensity={0.2} color="#8aa0c0" />
        <directionalLight position={[-24, 8, -16]} intensity={0.18} color="#6b5a88" />

        <Suspense fallback={null}>
          {/* User-tintable nebula split */}
          <NebulaField colors={nebulaCustomization} />

          {/* Sharp pinprick starfield */}
          <StarryBackground />

          {/* Whisper-Thin Architectural Kepler Orbit Tracks */}
          <OrbitPaths />

          {/* Central Luminous Solar Sun: Orbit Core */}
          <SunCore
            onSelect={() => onSelectSpecialist("core")}
            isSelected={selectedSpecialistId === "core"}
          />

          {/* All specialists use AlienPlanet — distinct fictional archetypes + Studio palette */}
          {planets.map((spec, index) => {
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

          {/* 3D Tracker updating HTML edge nametags at 60fps */}
          <PlanetScreenTracker
            selectedSpecialistId={selectedSpecialistId}
            planetPositionsRef={planetPositionsRef}
            overlayContainerRef={overlayContainerRef}
          />
        </Suspense>

        {/* Gravitational Multi-Agent Constellation Beams */}
        <GravitationalBeams
          activeTargets={activeConstellationTargets}
          planetPositions={planetPositions}
        />

        {/* Camera Orchestration */}
        <CameraChoreographer
          selectedSpecialistId={selectedSpecialistId}
          planetPositions={planetPositions}
          isTouring={isTouring}
          tourStep={tourStep}
        />

        {/* User 3D Orbit Controls in Overview Mode */}
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

      {/* Top-Level Off-Screen Planet Indicators HTML Overlay */}
      <OffScreenIndicatorsOverlay
        containerRef={overlayContainerRef}
        onSelectSpecialist={onSelectSpecialist}
      />
    </div>
  );
}
