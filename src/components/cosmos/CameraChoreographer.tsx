"use client";

import React, { useRef, useEffect, useMemo } from "react";
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
  const defaultOverviewPos = useMemo(() => new THREE.Vector3(0, 14, 23), []);
  const defaultOverviewLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const targetCamPos = useRef(new THREE.Vector3(0, 14, 23));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  const isTransitioning = useRef(false);
  const prevSelectedRef = useRef<SpecialistId | null>(null);

  // Waypoints for the Solar Dawn Morning Briefing Tour
  const tourTargets: SpecialistId[] = ["core", "schedule", "health", "wallet", "core"];

  // Interrupt return animation if user touches mouse wheel or drags
  useEffect(() => {
    const handleUserInterrupt = () => {
      if (isTransitioning.current) {
        isTransitioning.current = false;
      }
    };
    window.addEventListener("wheel", handleUserInterrupt, { passive: true });
    window.addEventListener("pointerdown", handleUserInterrupt, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleUserInterrupt);
      window.removeEventListener("pointerdown", handleUserInterrupt);
    };
  }, []);

  useEffect(() => {
    if (isTouring) {
      isTransitioning.current = false;
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

    if (selectedSpecialistId) {
      isTransitioning.current = false;
      if (selectedSpecialistId === "core") {
        targetCamPos.current.set(0, 3.2, 5.8);
        targetLookAt.current.set(0, 0, 0);
      } else {
        const pPos = planetPositions[selectedSpecialistId];
        if (pPos) {
          targetCamPos.current.set(pPos.x + 2.2, pPos.y + 1.2, pPos.z + 2.8);
          targetLookAt.current.copy(pPos);
        }
      }
    } else {
      // Returned from planet focus to overview
      if (prevSelectedRef.current !== null) {
        targetCamPos.current.copy(defaultOverviewPos);
        targetLookAt.current.copy(defaultOverviewLookAt);
        isTransitioning.current = true;
      } else {
        isTransitioning.current = false;
      }
    }

    prevSelectedRef.current = selectedSpecialistId;
  }, [selectedSpecialistId, isTouring, tourStep, planetPositions, defaultOverviewPos, defaultOverviewLookAt]);

  useFrame((state, delta) => {
    if (isTouring) {
      camera.position.lerp(targetCamPos.current, delta * 2.4);
      currentLookAt.current.lerp(targetLookAt.current, delta * 2.4);
      camera.lookAt(currentLookAt.current);
      return;
    }

    if (selectedSpecialistId) {
      if (selectedSpecialistId !== "core") {
        const pPos = planetPositions[selectedSpecialistId];
        if (pPos) {
          targetCamPos.current.set(pPos.x + 2.2, pPos.y + 1.2, pPos.z + 2.8);
          targetLookAt.current.copy(pPos);
        }
      }
      camera.position.lerp(targetCamPos.current, delta * 3.4);
      currentLookAt.current.lerp(targetLookAt.current, delta * 3.4);
      camera.lookAt(currentLookAt.current);
      return;
    }

    // In overview mode: ONLY lerp if transitioning back from a planet cockpit
    if (isTransitioning.current) {
      camera.position.lerp(targetCamPos.current, delta * 3.2);
      currentLookAt.current.lerp(targetLookAt.current, delta * 3.2);
      camera.lookAt(currentLookAt.current);

      if (camera.position.distanceTo(targetCamPos.current) < 0.25) {
        isTransitioning.current = false;
      }
    }
    // When not transitioning in overview, do NOT touch camera position or lookAt!
    // OrbitControls has full freedom to zoom in/out and rotate without rubber-banding.
  });

  return null;
}
