"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SpecialistConfig, SpecialistId, PlanetCustomization, DEFAULT_PLANET_CUSTOMIZATIONS } from "@/types/orbit";
import { generateExoplanetTextures, generateExoplanetRingTexture } from "@/lib/exoplanetTextures";

interface PlanetBodyProps {
  config: SpecialistConfig;
  initialAngle: number;
  onSelect: (id: SpecialistId) => void;
  isSelected: boolean;
  onPositionUpdate?: (id: SpecialistId, pos: THREE.Vector3) => void;
  customization?: PlanetCustomization;
}

export function PlanetBody({
  config,
  initialAngle,
  onSelect,
  isSelected,
  onPositionUpdate,
  customization,
}: PlanetBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<Array<THREE.Group | null>>([]);

  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(initialAngle);
  const currentScaleRef = useRef(1.0);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Effective customization config
  const custom = useMemo(() => {
    return customization || DEFAULT_PLANET_CUSTOMIZATIONS[config.id] || {
      id: config.id,
      archetype: "gas_giant" as const,
      primaryColor: config.color,
      secondaryColor: config.glowColor,
      accentColor: "#ffffff",
      bumpScale: 0.1,
      roughness: 0.35,
      hasRings: false,
      ringStyle: "none" as const,
      ringColor: config.color,
      ringTilt: 0.2,
      moons: [],
    };
  }, [customization, config.id, config.color, config.glowColor]);

  // Procedural exoplanet textures matching the Sketchfab exoplanet reference
  const textures = useMemo(() => {
    return generateExoplanetTextures(custom);
  }, [custom]);

  // Dynamic concentric ring texture
  const ringTexture = useMemo(() => {
    if (custom.hasRings && custom.ringStyle !== "none") {
      return generateExoplanetRingTexture(custom.ringStyle, custom.ringColor);
    }
    return null;
  }, [custom.hasRings, custom.ringStyle, custom.ringColor]);

  // Track moon angles
  const moonAngles = useRef<number[]>(custom.moons.map((_, i) => (i * Math.PI * 2) / Math.max(1, custom.moons.length)));

  useFrame((_, delta) => {
    // Orbital revolution around central Sun
    const speedMult = hovered ? 0.08 : 0.32;
    angleRef.current += delta * config.orbitSpeed * speedMult;

    const x = Math.cos(angleRef.current) * config.orbitRadius;
    const z = Math.sin(angleRef.current) * config.orbitRadius;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);

      if (onPositionUpdate) {
        groupRef.current.getWorldPosition(tempVec);
        onPositionUpdate(config.id, tempVec);
      }
    }

    // Smooth axial rotation
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.28;
    }

    // Silky smooth scale interpolation
    const targetScale = hovered ? 1.12 : isSelected ? 1.18 : 1.0;
    currentScaleRef.current = THREE.MathUtils.damp(
      currentScaleRef.current,
      targetScale,
      4.5,
      delta
    );

    const s = currentScaleRef.current;
    if (planetMeshRef.current) {
      planetMeshRef.current.scale.set(s, s, s);
    }

    if (atmosphereMeshRef.current) {
      const atmoScale = s * 1.035;
      atmosphereMeshRef.current.scale.set(atmoScale, atmoScale, atmoScale);
    }

    // Dynamic satellite moon orbits
    custom.moons.forEach((moon, idx) => {
      if (!moonAngles.current[idx]) moonAngles.current[idx] = 0;
      moonAngles.current[idx] += delta * moon.speed * 0.8;

      const moonEl = moonRefs.current[idx];
      if (moonEl) {
        const mx = Math.cos(moonAngles.current[idx]) * (config.size * moon.distance);
        const mz = Math.sin(moonAngles.current[idx]) * (config.size * moon.distance);
        moonEl.position.set(mx, 0.1, mz);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Exoplanet Surface Sphere */}
      <mesh
        ref={planetMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(config.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[config.size, 64, 64]} />
        <meshStandardMaterial
          map={textures.colorMap}
          bumpMap={textures.bumpMap}
          bumpScale={custom.bumpScale}
          roughness={custom.roughness}
          metalness={0.06}
        />
      </mesh>

      {/* Atmospheric Rayleigh Limb Scattering / Fresnel Rim Glow */}
      <mesh ref={atmosphereMeshRef}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial
          color={custom.secondaryColor}
          transparent
          opacity={hovered || isSelected ? 0.24 : 0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Dynamic Customizable Planetary Rings */}
      {custom.hasRings && ringTexture && (
        <mesh rotation={[-Math.PI / 3.2, custom.ringTilt, 0]}>
          <ringGeometry args={[config.size * 1.35, config.size * 2.35, 96]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.82}
            roughness={0.25}
            metalness={0.04}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Dynamic Customizable Satellite Moons */}
      {custom.moons.map((moon, idx) => (
        <group
          key={moon.id || idx}
          ref={(el) => {
            moonRefs.current[idx] = el;
          }}
        >
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect(config.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[moon.size, 24, 24]} />
            <meshStandardMaterial
              color={moon.color}
              roughness={0.45}
              metalness={0.05}
            />
          </mesh>
        </group>
      ))}

      {/* Zen Minimalist Telemetry Badge on Hover */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 1.1, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-150 font-sans">
            <div className="px-3.5 py-2 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-glass-md text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: custom.primaryColor }}
                />
                <span className="text-xs font-semibold text-zinc-100 tracking-tight whitespace-nowrap">
                  {config.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 pl-4 whitespace-nowrap">
                {config.domain} · {custom.archetype.replace("_", " ")}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 pl-4 mt-1">
                Click to enter domain
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
