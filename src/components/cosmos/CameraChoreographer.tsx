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
  // Tightly zoomed-in default overview perspective
  const targetCamPos = useRef(new THREE.Vector3(0, 14, 23));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Waypoints for the Solar Dawn Morning Briefing Tour
  const tourTargets: SpecialistId[] = ["core", "schedule", "health", "wallet", "core"];

  useEffect(() => {
    if (isTouring) {
      const activeId = tourTargets[tourStep] || "core";
      if (activeId === "core") {
        targetCamPos.current.set(0, 3.2, 5.8);
        targetLookAt.current.set(0, 0, 0);
      } else {
        const pPos = planetPositions[activeId] || new THREE.Vector3(8, 0, 8);
        targetCamPos.current.set(pPos.x + 2.2, pPos.y + 1.2, pPos.z + 2.8);
        targetLookAt.current.copy(pPos);
      }
      return;
    }

    if (!selectedSpecialistId) {
      // Intimate, zoomed-in overview perspective
      targetCamPos.current.set(0, 14, 23);
      targetLookAt.current.set(0, 0, 0);
    } else if (selectedSpecialistId === "core") {
      // Close focus on Sun Core
      targetCamPos.current.set(0, 3.2, 5.8);
      targetLookAt.current.set(0, 0, 0);
    } else {
      // Zoom into selected planet
      const pPos = planetPositions[selectedSpecialistId];
      if (pPos) {
        targetCamPos.current.set(pPos.x + 2.2, pPos.y + 1.2, pPos.z + 2.8);
        targetLookAt.current.copy(pPos);
      }
    }
  }, [selectedSpecialistId, isTouring, tourStep, planetPositions]);

  useFrame((state, delta) => {
    // Dynamic tracking of planet position if selected while orbiting
    if (selectedSpecialistId && selectedSpecialistId !== "core" && !isTouring) {
      const pPos = planetPositions[selectedSpecialistId];
      if (pPos) {
        targetCamPos.current.set(pPos.x + 2.2, pPos.y + 1.2, pPos.z + 2.8);
        targetLookAt.current.copy(pPos);
      }
    }

    // Smooth lerp camera position
    const lerpSpeed = isTouring ? 2.4 : 3.4;
    camera.position.lerp(targetCamPos.current, delta * lerpSpeed);

    // Smooth lerp lookAt target
    currentLookAt.current.lerp(targetLookAt.current, delta * lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
