"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SpecialistId } from "@/types/orbit";

interface CameraChoreographerProps {
  selectedSpecialistId: SpecialistId | null;
  planetPositions: Record<string, THREE.Vector3>;
  isTouring: boolean;
  tourStep: number;
}

export function CameraChoreographer({
  selectedSpecialistId,
  planetPositions,
  isTouring,
  tourStep,
}: CameraChoreographerProps) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 26, 42));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Waypoints for the Solar Dawn Morning Briefing Tour
  const tourTargets: SpecialistId[] = ["core", "schedule", "health", "wallet", "core"];

  useEffect(() => {
    if (isTouring) {
      const activeId = tourTargets[tourStep] || "core";
      if (activeId === "core") {
        targetCamPos.current.set(0, 4.0, 7.5);
        targetLookAt.current.set(0, 0, 0);
      } else {
        const pPos = planetPositions[activeId] || new THREE.Vector3(10, 0, 10);
        targetCamPos.current.set(pPos.x + 2.8, pPos.y + 1.6, pPos.z + 3.6);
        targetLookAt.current.copy(pPos);
      }
      return;
    }

    if (!selectedSpecialistId) {
      // Overview solar system view
      targetCamPos.current.set(0, 26, 42);
      targetLookAt.current.set(0, 0, 0);
    } else if (selectedSpecialistId === "core") {
      // Close focus on Sun Core
      targetCamPos.current.set(0, 3.8, 7.2);
      targetLookAt.current.set(0, 0, 0);
    } else {
      // Zoom into selected planet
      const pPos = planetPositions[selectedSpecialistId];
      if (pPos) {
        targetCamPos.current.set(pPos.x + 2.6, pPos.y + 1.4, pPos.z + 3.2);
        targetLookAt.current.copy(pPos);
      }
    }
  }, [selectedSpecialistId, isTouring, tourStep, planetPositions]);

  useFrame((state, delta) => {
    // Dynamic tracking of planet position if selected while orbiting
    if (selectedSpecialistId && selectedSpecialistId !== "core" && !isTouring) {
      const pPos = planetPositions[selectedSpecialistId];
      if (pPos) {
        targetCamPos.current.set(pPos.x + 2.6, pPos.y + 1.4, pPos.z + 3.2);
        targetLookAt.current.copy(pPos);
      }
    }

    // Smooth lerp camera position
    const lerpSpeed = isTouring ? 2.2 : 3.2;
    camera.position.lerp(targetCamPos.current, delta * lerpSpeed);

    // Smooth lerp lookAt target
    currentLookAt.current.lerp(targetLookAt.current, delta * lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
