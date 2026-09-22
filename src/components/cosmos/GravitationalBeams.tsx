"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpecialistId } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";

interface GravitationalBeamsProps {
  activeTargets: SpecialistId[];
  planetPositions: Record<string, THREE.Vector3>;
}

export function GravitationalBeams({
  activeTargets,
  planetPositions,
}: GravitationalBeamsProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle pulse on beam opacity
      const opacity = 0.5 + Math.sin(state.clock.getElapsedTime() * 6) * 0.25;
      groupRef.current.children.forEach((child) => {
        if ((child as any).material) {
          (child as any).material.opacity = opacity;
        }
      });
    }
  });

  const beamLines = useMemo(() => {
    return activeTargets
      .map((targetId) => {
        const targetPos = planetPositions[targetId];
        if (!targetPos) return null;

        const spec = SPECIALISTS[targetId];
        if (!spec) return null;

        const points = [new THREE.Vector3(0, 0, 0), targetPos];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const line = new THREE.Line(geometry, material);
        return { id: targetId, line };
      })
      .filter(Boolean) as Array<{ id: SpecialistId; line: THREE.Line }>;
  }, [activeTargets, planetPositions]);

  if (activeTargets.length === 0) return null;

  return (
    <group ref={groupRef}>
      {beamLines.map((beam) => (
        <primitive key={beam.id} object={beam.line} />
      ))}
    </group>
  );
}
