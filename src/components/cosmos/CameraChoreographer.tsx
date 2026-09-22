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
  const { camera, controls } = useThree();

  // Full solar system overview position: fits all 8 orbits (up to radius 39.2) with spacious framing
  const defaultOverviewPos = useMemo(() => new THREE.Vector3(0, 48, 80), []);
  const defaultOverviewLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const targetCamPos = useRef(new THREE.Vector3(0, 48, 80));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Parallax tracking
  const parallaxOffset = useRef(new THREE.Vector2(0, 0));
  const isPointerDown = useRef(false);
  const isTransitioning = useRef(false);
  const prevSelectedRef = useRef<string | null>(null);
  const planetPositionsRef = useRef<Record<string, THREE.Vector3>>(planetPositions);

  // Keep planetPositions ref continuously updated without triggering mode-transition effect
  planetPositionsRef.current = planetPositions;

  // Tour waypoints
  const tourTargets: SpecialistId[] = ["core", "schedule", "health", "wallet", "core"];

  useEffect(() => {
    const handleDown = () => {
      isPointerDown.current = true;
    };
    const handleUp = () => {
      isPointerDown.current = false;
    };

    window.addEventListener("pointerdown", handleDown, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
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
        const pPos = planetPositionsRef.current[activeId] || new THREE.Vector3(8, 0, 8);
        targetCamPos.current.set(pPos.x + 2.8, pPos.y + 1.4, pPos.z + 3.2);
        targetLookAt.current.copy(pPos);
      }
      prevSelectedRef.current = "touring";
      if (controls) {
        (controls as any).enabled = false;
      }
      return;
    }

    if (selectedSpecialistId) {
      isTransitioning.current = false;
      if (selectedSpecialistId === "core") {
        targetCamPos.current.set(0, 3.2, 5.8);
        targetLookAt.current.set(0, 0, 0);
      } else {
        const pPos = planetPositionsRef.current[selectedSpecialistId];
        if (pPos) {
          targetCamPos.current.set(pPos.x + 2.8, pPos.y + 1.4, pPos.z + 3.2);
          targetLookAt.current.copy(pPos);
        }
      }
      prevSelectedRef.current = selectedSpecialistId;
      if (controls) {
        (controls as any).enabled = false;
      }
      return;
    }

    // Selected is null: Returning to overview from either a specialist planet or tour
    if (prevSelectedRef.current !== null) {
      targetCamPos.current.copy(defaultOverviewPos);
      targetLookAt.current.copy(defaultOverviewLookAt);
      isTransitioning.current = true;
      if (controls) {
        (controls as any).enabled = false;
      }
    }

    prevSelectedRef.current = null;
  }, [selectedSpecialistId, isTouring, tourStep, defaultOverviewPos, defaultOverviewLookAt, controls]);

  useFrame((state, delta) => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Smooth mouse parallax in 3D
    const targetParallaxX = prefersReducedMotion ? 0 : state.pointer.x * 1.2;
    const targetParallaxY = prefersReducedMotion ? 0 : state.pointer.y * 0.8;

    const dampSpeed = 2.8;
    parallaxOffset.current.x = THREE.MathUtils.damp(
      parallaxOffset.current.x,
      targetParallaxX,
      dampSpeed,
      delta
    );
    parallaxOffset.current.y = THREE.MathUtils.damp(
      parallaxOffset.current.y,
      targetParallaxY,
      dampSpeed,
      delta
    );

    // 1. Solar Dawn Tour
    if (isTouring) {
      const tourSpeed = 2.6;
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        targetCamPos.current.x + parallaxOffset.current.x * 0.3,
        tourSpeed,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        targetCamPos.current.y + parallaxOffset.current.y * 0.2,
        tourSpeed,
        delta
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        targetCamPos.current.z,
        tourSpeed,
        delta
      );

      currentLookAt.current.x = THREE.MathUtils.damp(
        currentLookAt.current.x,
        targetLookAt.current.x,
        tourSpeed,
        delta
      );
      currentLookAt.current.y = THREE.MathUtils.damp(
        currentLookAt.current.y,
        targetLookAt.current.y,
        tourSpeed,
        delta
      );
      currentLookAt.current.z = THREE.MathUtils.damp(
        currentLookAt.current.z,
        targetLookAt.current.z,
        tourSpeed,
        delta
      );

      camera.lookAt(currentLookAt.current);
      return;
    }

    // 2. Focused on Specialist Planet
    if (selectedSpecialistId) {
      if (selectedSpecialistId !== "core") {
        const pPos = planetPositionsRef.current[selectedSpecialistId];
        if (pPos) {
          targetCamPos.current.set(pPos.x + 2.8, pPos.y + 1.4, pPos.z + 3.2);
          targetLookAt.current.copy(pPos);
        }
      }

      const focusSpeed = 2.8;
      const targetX = targetCamPos.current.x + parallaxOffset.current.x * 0.25;
      const targetY = targetCamPos.current.y + parallaxOffset.current.y * 0.18;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, focusSpeed, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, focusSpeed, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, focusSpeed, delta);

      currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.current.x, focusSpeed, delta);
      currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.current.y, focusSpeed, delta);
      currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.current.z, focusSpeed, delta);

      camera.lookAt(currentLookAt.current);
      return;
    }

    // 3. Smooth Cinematic Zoom-Out Back to Full System Overview
    if (isTransitioning.current) {
      const returnSpeed = 3.2; // Smooth and responsive zoom-out
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, returnSpeed, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, returnSpeed, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, returnSpeed, delta);

      currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.current.x, returnSpeed, delta);
      currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.current.y, returnSpeed, delta);
      currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.current.z, returnSpeed, delta);

      camera.lookAt(currentLookAt.current);

      if (
        camera.position.distanceTo(targetCamPos.current) < 0.25 &&
        currentLookAt.current.distanceTo(targetLookAt.current) < 0.25
      ) {
        camera.position.copy(targetCamPos.current);
        camera.lookAt(targetLookAt.current);
        if (controls) {
          (controls as any).target.copy(targetLookAt.current);
          (controls as any).update();
          (controls as any).enabled = true;
        }
        isTransitioning.current = false;
      }
      return;
    }

    // 4. Free Overview Mode with subtle rotational parallax
    if (!isPointerDown.current && !prefersReducedMotion) {
      camera.rotation.z = THREE.MathUtils.damp(
        camera.rotation.z,
        -parallaxOffset.current.x * 0.015,
        2.5,
        delta
      );
    }
  });

  return null;
}
