"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SpecialistConfig, SpecialistId } from "@/types/orbit";
import { generatePlanetTextures, generateRingTexture } from "@/lib/planetTextures";

interface PlanetBodyProps {
  config: SpecialistConfig;
  initialAngle: number;
  onSelect: (id: SpecialistId) => void;
  isSelected: boolean;
  onPositionUpdate?: (id: SpecialistId, pos: THREE.Vector3) => void;
}

export function PlanetBody({
  config,
  initialAngle,
  onSelect,
  isSelected,
  onPositionUpdate,
}: PlanetBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const moonGroupRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(initialAngle);

  // Position vector for parent notification
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Generate procedural textures with bump elevation relief
  const textures = useMemo(() => {
    return generatePlanetTextures(config.id);
  }, [config.id]);

  // Procedural Ring Textures for planets with rings
  const saturnRingTexture = useMemo(() => {
    return config.id === "wallet" ? generateRingTexture("saturn") : null;
  }, [config.id]);

  const iceRingTexture = useMemo(() => {
    return config.id === "study" ? generateRingTexture("ice") : null;
  }, [config.id]);

  const dustRingTexture = useMemo(() => {
    return config.id === "explore" ? generateRingTexture("dust") : null;
  }, [config.id]);

  const meridianRingTexture = useMemo(() => {
    return config.id === "schedule" ? generateRingTexture("meridian") : null;
  }, [config.id]);

  // Satellite Moon textures for natural orbital companions
  const moonTextures = useMemo(() => {
    if (config.id === "wallet") return generatePlanetTextures("deals");
    if (config.id === "career") return generatePlanetTextures("build");
    return null;
  }, [config.id]);

  useFrame((state, delta) => {
    // Orbital motion around Sun
    const speedMult = hovered ? 0.08 : 0.35;
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

    // Axial rotation (day/night cycle)
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.45;
    }

    // Secondary atmosphere cloud rotation
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += delta * 0.6;
    }

    // Satellite moon orbit
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += delta * 1.4;
    }
  });

  // Physical planet material with realistic bump grain catching the terminator shadow
  const planetMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: textures.map,
      bumpMap: textures.bump,
      bumpScale: 0.14,
      roughness: 0.82,
      metalness: 0.04,
    });
    return mat;
  }, [textures]);

  // Satellite Moon material with matching tactile relief
  const moonMaterial = useMemo(() => {
    if (!moonTextures) return null;
    return new THREE.MeshStandardMaterial({
      map: moonTextures.map,
      bumpMap: moonTextures.bump,
      bumpScale: 0.12,
      roughness: 0.85,
      metalness: 0.04,
    });
  }, [moonTextures]);

  const targetScale = hovered ? 1.16 : isSelected ? 1.22 : 1.0;

  return (
    <group ref={groupRef}>
      {/* Click and Hover Target */}
      <mesh
        ref={planetMeshRef}
        scale={[targetScale, targetScale, targetScale]}
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
        <sphereGeometry args={[config.size, 48, 48]} />
        <primitive object={planetMaterial} attach="material" />
      </mesh>

      {/* Atmospheric Rim Glow Shell */}
      <mesh scale={[targetScale * 1.03, targetScale * 1.03, targetScale * 1.03]}>
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={hovered || isSelected ? 0.22 : 0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Earth-like Cloud Atmosphere for Health */}
      {config.id === "health" && (
        <mesh ref={cloudsMeshRef} scale={[targetScale * 1.02, targetScale * 1.02, targetScale * 1.02]}>
          <sphereGeometry args={[config.size, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.25}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Saturn-Style Concentric Dust Rings with Cassini Division for Wallet */}
      {config.id === "wallet" && saturnRingTexture && (
        <mesh rotation={[-Math.PI / 3, 0.2, 0]}>
          <ringGeometry args={[config.size * 1.35, config.size * 2.35, 64]} />
          <meshStandardMaterial
            map={saturnRingTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Slanted Ice Rings for Study */}
      {config.id === "study" && iceRingTexture && (
        <mesh rotation={[Math.PI / 5, -0.3, 0]}>
          <ringGeometry args={[config.size * 1.3, config.size * 2.1, 64]} />
          <meshStandardMaterial
            map={iceRingTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.75}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Cosmic Amethyst Dust Rings for Explore */}
      {config.id === "explore" && dustRingTexture && (
        <mesh rotation={[-Math.PI / 4, 0.4, 0]}>
          <ringGeometry args={[config.size * 1.35, config.size * 2.15, 64]} />
          <meshStandardMaterial
            map={dustRingTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Chrono Cyan Meridian Rings for Schedule */}
      {config.id === "schedule" && meridianRingTexture && (
        <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
          <ringGeometry args={[config.size * 1.25, config.size * 1.45, 64]} />
          <meshBasicMaterial
            map={meridianRingTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Satellite Moons (Deals near Wallet, Build near Career) */}
      {(config.id === "wallet" || config.id === "career") && (
        <group ref={moonGroupRef}>
          <mesh
            position={[config.size * 2.5, 0.3, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(config.id === "wallet" ? "deals" : "build");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[0.3, 32, 32]} />
            {moonMaterial ? (
              <primitive object={moonMaterial} attach="material" />
            ) : (
              <meshStandardMaterial
                color={config.id === "wallet" ? "#34d399" : "#818cf8"}
                roughness={0.8}
              />
            )}
          </mesh>
        </group>
      )}

      {/* Prominent, Ultra-Readable Zen Hover Telemetry Badge */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 1.2, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-200">
            <div
              className="px-4 py-2.5 rounded-2xl border text-left shadow-2xl backdrop-blur-2xl"
              style={{
                backgroundColor: "rgba(9, 10, 13, 0.95)",
                borderColor: `${config.color}55`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px ${config.color}22`,
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-display font-semibold text-white tracking-wide whitespace-nowrap">
                  {config.name}
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider pl-4 whitespace-nowrap">
                {config.domain}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 pl-4 mt-1 flex items-center gap-1">
                <span>Click to enter cockpit</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
