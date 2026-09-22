"use client";

import React, { useState, useCallback, useMemo, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SpecialistId, PlanetCustomization } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { StarryBackground } from "./StarryBackground";
import { SunCore } from "./SunCore";
import { PlanetBody } from "./PlanetBody";
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
}

export function SolarSystemCanvas({
  selectedSpecialistId,
  onSelectSpecialist,
  onDeselect,
  activeConstellationTargets = [],
  isTouring = false,
  tourStep = 0,
  planetCustomizations = {},
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

  return (
    <div className="w-full h-full absolute inset-0 bg-[#030508] overflow-hidden">
      <Canvas
        camera={{ position: [0, 48, 80], fov: 42, near: 0.1, far: 1500 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onPointerMissed={() => {
          if (selectedSpecialistId && !isTouring) {
            onDeselect();
          }
        }}
      >
        <color attach="background" args={["#030508"]} />

        {/* Ethereal Space Lighting for Satin Spheres */}
        <ambientLight intensity={0.15} />
        <directionalLight position={[-14, 20, 24]} intensity={0.55} color="#ffffff" />
        <directionalLight position={[16, -10, -18]} intensity={0.25} color="#94a3b8" />

        <Suspense fallback={null}>
          {/* Brilliant Dense Diamond Starfield & Galactic Clusters */}
          <StarryBackground />

          {/* Whisper-Thin Architectural Kepler Orbit Tracks */}
          <OrbitPaths />

          {/* Central Luminous Solar Sun: Orbit Core */}
          <SunCore
            onSelect={() => onSelectSpecialist("core")}
            isSelected={selectedSpecialistId === "core"}
          />

          {/* Orbiting Specialist Celestial Spheres with Ethereal Atmospheric Finish */}
          {planets.map((spec, index) => (
            <PlanetBody
              key={spec.id}
              config={spec}
              initialAngle={(index * 2.3999632) % (Math.PI * 2)}
              onSelect={onSelectSpecialist}
              isSelected={selectedSpecialistId === spec.id}
              onPositionUpdate={handlePositionUpdate}
              customization={planetCustomizations[spec.id]}
            />
          ))}

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
          minDistance={15}
          maxDistance={240}
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
