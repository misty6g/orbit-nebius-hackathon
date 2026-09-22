"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SpecialistConfig, SpecialistId } from "@/types/orbit";

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

  useFrame((state, delta) => {
    // Orbital motion
    const speedMult = hovered ? 0.08 : 0.4;
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

    // Axial rotation
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.6;
    }

    // Secondary atmosphere / cloud rotation for Earth-like planets
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += delta * 0.75;
    }

    // Satellite moon orbit
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += delta * 1.8;
    }
  });

  // Unique planet textures and visuals per domain
  const planetMaterial = useMemo(() => {
    switch (config.id) {
      case "health":
        return new THREE.MeshStandardMaterial({
          color: "#059669",
          roughness: 0.5,
          metalness: 0.1,
          emissive: "#047857",
          emissiveIntensity: 0.25,
        });
      case "move":
        return new THREE.MeshStandardMaterial({
          color: "#ea580c",
          roughness: 0.8,
          metalness: 0.2,
          emissive: "#c2410c",
          emissiveIntensity: 0.35,
        });
      case "schedule":
        return new THREE.MeshStandardMaterial({
          color: "#0891b2",
          roughness: 0.3,
          metalness: 0.7,
          emissive: "#06b6d4",
          emissiveIntensity: 0.3,
        });
      case "study":
        return new THREE.MeshStandardMaterial({
          color: "#0284c7",
          roughness: 0.2,
          metalness: 0.5,
          emissive: "#38bdf8",
          emissiveIntensity: 0.4,
        });
      case "wallet":
        return new THREE.MeshStandardMaterial({
          color: "#ca8a04",
          roughness: 0.4,
          metalness: 0.3,
          emissive: "#eab308",
          emissiveIntensity: 0.35,
        });
      case "explore":
        return new THREE.MeshStandardMaterial({
          color: "#7e22ce",
          roughness: 0.5,
          metalness: 0.4,
          emissive: "#a855f7",
          emissiveIntensity: 0.3,
        });
      case "travel":
        return new THREE.MeshStandardMaterial({
          color: "#0284c7",
          roughness: 0.3,
          metalness: 0.2,
          emissive: "#0ea5e9",
          emissiveIntensity: 0.35,
        });
      case "career":
        return new THREE.MeshStandardMaterial({
          color: "#4338ca",
          roughness: 0.4,
          metalness: 0.8,
          emissive: "#6366f1",
          emissiveIntensity: 0.35,
        });
      default:
        return new THREE.MeshStandardMaterial({
          color: config.color,
          roughness: 0.5,
          metalness: 0.2,
        });
    }
  }, [config]);

  const targetScale = hovered ? 1.15 : isSelected ? 1.2 : 1.0;

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
        <sphereGeometry args={[config.size, 32, 32]} />
        <primitive object={planetMaterial} attach="material" />
      </mesh>

      {/* Atmospheric Glow Shell */}
      <mesh scale={[targetScale * 1.08, targetScale * 1.08, targetScale * 1.08]}>
        <sphereGeometry args={[config.size, 24, 24]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={hovered || isSelected ? 0.35 : 0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Health Cloud Layer */}
      {config.id === "health" && (
        <mesh ref={cloudsMeshRef} scale={[targetScale * 1.02, targetScale * 1.02, targetScale * 1.02]}>
          <sphereGeometry args={[config.size, 24, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Wallet Planetary Dust Rings (Saturn style) */}
      {config.id === "wallet" && (
        <mesh rotation={[-Math.PI / 3, 0.2, 0]}>
          <ringGeometry args={[config.size * 1.35, config.size * 2.1, 48]} />
          <meshStandardMaterial
            color="#fbbf24"
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Schedule Meridian Time Rings */}
      {config.id === "schedule" && (
        <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
          <ringGeometry args={[config.size * 1.25, config.size * 1.32, 36]} />
          <meshBasicMaterial
            color="#22d3ee"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* Moonlet Orbits (Deals near Wallet, Build near Career) */}
      {(config.id === "wallet" || config.id === "career") && (
        <group ref={moonGroupRef}>
          <mesh
            position={[config.size * 2.4, 0.2, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(config.id === "wallet" ? "deals" : "build");
            }}
          >
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={config.id === "wallet" ? "#34d399" : "#818cf8"}
              emissive={config.id === "wallet" ? "#10b981" : "#6366f1"}
              emissiveIntensity={0.4}
              roughness={0.4}
            />
          </mesh>
        </group>
      )}

      {/* Holographic Telemetry Label on Hover or Active */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 0.9, 0]} center distanceFactor={14}>
          <div
            className="pointer-events-none px-2.5 py-1 rounded-full backdrop-blur-md border text-center whitespace-nowrap shadow-glass-sm transition-all duration-200"
            style={{
              backgroundColor: "rgba(3, 7, 18, 0.85)",
              borderColor: config.color,
            }}
          >
            <div className="text-[11px] font-display font-medium text-white tracking-wide flex items-center gap-1.5 justify-center">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: config.color }}
              />
              {config.name}
            </div>
            <div className="text-[9px] font-mono text-gray-300 uppercase tracking-wider">
              {config.domain}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
