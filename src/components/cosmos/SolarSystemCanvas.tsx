"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SpecialistId } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";
import { StarryBackground } from "./StarryBackground";
import { SunCore } from "./SunCore";
import { PlanetBody } from "./PlanetBody";
import { OrbitPaths } from "./OrbitPaths";
import { GravitationalBeams } from "./GravitationalBeams";
import { CameraChoreographer } from "./CameraChoreographer";

interface SolarSystemCanvasProps {
  selectedSpecialistId: SpecialistId | null;
  onSelectSpecialist: (id: SpecialistId) => void;
  onDeselect: () => void;
  activeConstellationTargets?: SpecialistId[];
  isTouring?: boolean;
  tourStep?: number;
}

export function SolarSystemCanvas({
  selectedSpecialistId,
  onSelectSpecialist,
  onDeselect,
  activeConstellationTargets = [],
  isTouring = false,
  tourStep = 0,
}: SolarSystemCanvasProps) {
  const [planetPositions, setPlanetPositions] = useState<Record<string, THREE.Vector3>>({});

  const handlePositionUpdate = useCallback((id: SpecialistId, pos: THREE.Vector3) => {
    setPlanetPositions((prev) => {
      // Small threshold to prevent continuous state re-renders if position barely changed
      const current = prev[id];
      if (current && current.distanceToSquared(pos) < 0.04) {
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
    <div className="w-full h-full absolute inset-0 bg-space-950 overflow-hidden">
      <Canvas
        camera={{ position: [0, 26, 42], fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => {
          if (selectedSpecialistId && !isTouring) {
            onDeselect();
          }
        }}
      >
        <color attach="background" args={["#030712"]} />

        {/* Cinematic Ambient Starlight */}
        <ambientLight intensity={0.25} />

        {/* Starry Cosmos Backdrop */}
        <StarryBackground />

        {/* Orbit Kepler Tracks */}
        <OrbitPaths />

        {/* Central Sun: Orbit Core */}
        <SunCore
          onSelect={() => onSelectSpecialist("core")}
          isSelected={selectedSpecialistId === "core"}
        />

        {/* Orbiting Specialist Planets */}
        {planets.map((spec, index) => (
          <PlanetBody
            key={spec.id}
            config={spec}
            initialAngle={(index * 2 * Math.PI) / planets.length}
            onSelect={onSelectSpecialist}
            isSelected={selectedSpecialistId === spec.id}
            onPositionUpdate={handlePositionUpdate}
          />
        ))}

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
        {allowManualOrbit && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={14}
            maxDistance={85}
            maxPolarAngle={Math.PI / 2 + 0.05} // Do not dip below disk
            minPolarAngle={Math.PI / 6} // Keep good orbital perspective
            rotateSpeed={0.6}
            zoomSpeed={0.8}
            dampingFactor={0.05}
          />
        )}
      </Canvas>
    </div>
  );
}
