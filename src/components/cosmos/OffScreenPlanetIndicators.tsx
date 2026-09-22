"use client";

import React, { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SPECIALISTS } from "@/lib/specialists";
import { SpecialistId } from "@/types/orbit";

export interface OffScreenIndicatorItem {
  id: SpecialistId;
  name: string;
  color: string;
  domain: string;
}

export const TRACKABLE_PLANETS: OffScreenIndicatorItem[] = Object.values(SPECIALISTS)
  .filter((s) => s.id !== "deals" && s.id !== "build")
  .map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    domain: s.domain,
  }));

interface PlanetScreenTrackerProps {
  selectedSpecialistId: SpecialistId | null;
  planetPositionsRef: React.RefObject<Record<string, THREE.Vector3>>;
  overlayContainerRef: React.RefObject<HTMLDivElement>;
}

/**
 * 3D Tracker running inside Canvas that directly updates HTML edge badges at 60fps
 */
export function PlanetScreenTracker({
  selectedSpecialistId,
  planetPositionsRef,
  overlayContainerRef,
}: PlanetScreenTrackerProps) {
  const { camera, size } = useThree();

  const vectors = useMemo(() => {
    return {
      planetPos: new THREE.Vector3(),
      camForward: new THREE.Vector3(),
      toPlanet: new THREE.Vector3(),
      ndc: new THREE.Vector3(),
      camSpacePos: new THREE.Vector3(),
    };
  }, []);

  useFrame(() => {
    const container = overlayContainerRef.current;
    if (!container) return;

    const camDist = camera.position.length();
    // Show off-screen nametags when zoomed in on a specialist OR when camera is closer than overview
    const isZoomed = selectedSpecialistId !== null || camDist < 60;

    if (!isZoomed) {
      container.style.opacity = "0";
      return;
    }

    container.style.opacity = "1";

    camera.getWorldDirection(vectors.camForward);
    const width = size.width;
    const height = size.height;

    const padX = 85;
    const padY = 55;

    const positions = planetPositionsRef.current || {};

    for (const planet of TRACKABLE_PLANETS) {
      const badgeEl = container.querySelector<HTMLDivElement>(`[data-indicator-id="${planet.id}"]`);
      if (!badgeEl) continue;

      // Hide indicator if this is the currently inspected planet
      if (planet.id === selectedSpecialistId) {
        badgeEl.style.display = "none";
        continue;
      }

      if (planet.id === "core") {
        vectors.planetPos.set(0, 0, 0);
      } else {
        const livePos = positions[planet.id];
        if (!livePos) {
          badgeEl.style.display = "none";
          continue;
        }
        vectors.planetPos.copy(livePos);
      }

      // Transform planet into camera space
      vectors.camSpacePos.copy(vectors.planetPos).applyMatrix4(camera.matrixWorldInverse);
      // In Three.js camera space, camera looks along -Z. So +Z is behind camera.
      const isBehind = vectors.camSpacePos.z >= -0.1;

      // Project 3D vector to Normalized Device Coordinates (NDC) [-1, 1]
      vectors.ndc.copy(vectors.planetPos).project(camera);

      // Check if visible within central screen area
      const isVisibleOnScreen =
        !isBehind &&
        vectors.ndc.x >= -0.88 &&
        vectors.ndc.x <= 0.88 &&
        vectors.ndc.y >= -0.88 &&
        vectors.ndc.y <= 0.88;

      if (isVisibleOnScreen) {
        badgeEl.style.display = "none";
        continue;
      }

      // Off-screen or behind camera: calculate screen edge direction
      let ndcX = vectors.ndc.x;
      let ndcY = vectors.ndc.y;

      if (isBehind) {
        // Correct inverted projection when behind the near plane
        ndcX = -ndcX;
        ndcY = -ndcY;
      }

      // Direction from screen center in CSS coordinates (+Y is downward)
      let dirX = ndcX;
      let dirY = -ndcY;

      const len = Math.hypot(dirX, dirY) || 1;
      const normX = dirX / len;
      const normY = dirY / len;

      const halfW = width / 2 - padX;
      const halfH = height / 2 - padY;

      const scaleX = Math.abs(halfW / (normX || 0.0001));
      const scaleY = Math.abs(halfH / (normY || 0.0001));
      const scale = Math.min(scaleX, scaleY);

      const screenX = width / 2 + normX * scale;
      const screenY = height / 2 + normY * scale;

      // Direction chevron pointing toward off-screen planet
      let chevron = "▶";
      if (scaleX < scaleY) {
        chevron = normX > 0 ? "▶" : "◀";
      } else {
        chevron = normY > 0 ? "▼" : "▲";
      }

      const distAU = Math.max(1, Math.round(camera.position.distanceTo(vectors.planetPos)));

      badgeEl.style.display = "flex";
      badgeEl.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%)`;

      const chevronEl = badgeEl.querySelector(".badge-chevron");
      if (chevronEl) chevronEl.textContent = chevron;

      const distEl = badgeEl.querySelector(".badge-dist");
      if (distEl) distEl.textContent = `${distAU} AU`;
    }
  });

  return null;
}

interface OffScreenIndicatorsOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onSelectSpecialist: (id: SpecialistId) => void;
}

/**
 * Top-level HTML overlay that renders the off-screen peripheral badges
 */
export function OffScreenIndicatorsOverlay({
  containerRef,
  onSelectSpecialist,
}: OffScreenIndicatorsOverlayProps) {
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden font-sans transition-opacity duration-300"
      style={{ opacity: 0 }}
    >
      {TRACKABLE_PLANETS.map((planet) => (
        <button
          key={planet.id}
          data-indicator-id={planet.id}
          style={{ display: "none" }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectSpecialist(planet.id);
          }}
          className="absolute items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#07080a]/92 border border-white/15 hover:border-amber-400 hover:bg-zinc-900 shadow-zen-dock backdrop-blur-xl pointer-events-auto cursor-pointer select-none transition-all group active:scale-95"
          title={`Warp camera to ${planet.name}`}
        >
          <span className="badge-chevron text-[11px] text-amber-400 font-mono transition-transform group-hover:scale-125">
            ▶
          </span>
          <span
            className="w-2 h-2 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: planet.color }}
          />
          <span className="text-xs font-medium text-zinc-200 group-hover:text-white whitespace-nowrap">
            {planet.name.replace("Orbit ", "")}
          </span>
          <span className="badge-dist text-[10px] font-mono text-zinc-400 group-hover:text-amber-300">
            --
          </span>
        </button>
      ))}
    </div>
  );
}
