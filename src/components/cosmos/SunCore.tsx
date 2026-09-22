"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SPECIALISTS } from "@/lib/specialists";
import { generateZenPlanetTexture } from "@/lib/zenPlanetTextures";

interface SunCoreProps {
  onSelect: () => void;
  isSelected: boolean;
}

export function SunCore({ onSelect, isSelected }: SunCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerCoronaRef = useRef<THREE.Mesh>(null);
  const outerCoronaRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Luminous Golden-Amber Solar Plasma Texture
  const zenTexture = useMemo(() => generateZenPlanetTexture("core"), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.06;
      // Gentle solar respiration
      const pulse = 1 + Math.sin(time * 1.2) * 0.012;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }

    if (innerCoronaRef.current) {
      innerCoronaRef.current.rotation.z -= delta * 0.03;
      const innerScale = 1.05 + Math.sin(time * 1.5) * 0.015;
      innerCoronaRef.current.scale.set(innerScale, innerScale, innerScale);
    }

    if (outerCoronaRef.current) {
      outerCoronaRef.current.rotation.y += delta * 0.02;
      const outerScale = 1.15 + Math.cos(time * 1.1) * 0.02;
      outerCoronaRef.current.scale.set(outerScale, outerScale, outerScale);
    }
  });

  const config = SPECIALISTS.core;

  return (
    <group position={[0, 0, 0]}>
      {/* Primary Radiant Illumination onto Celestial Spheres */}
      <pointLight color="#fffbeb" intensity={4.8} distance={150} decay={1.1} />
      <pointLight color="#fbbf24" intensity={2.2} distance={55} decay={1.15} />

      {/* Main Luminous Solar Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
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
          map={zenTexture}
          emissive="#d97706"
          emissiveMap={zenTexture}
          emissiveIntensity={0.85}
          roughness={0.32}
          metalness={0.06}
        />
      </mesh>

      {/* Soft Coronal Envelope */}
      <mesh ref={innerCoronaRef}>
        <sphereGeometry args={[config.size * 1.05, 32, 32]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Atmospheric Solar Haze */}
      <mesh ref={outerCoronaRef}>
        <sphereGeometry args={[config.size * 1.16, 32, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Zen Minimalist Telemetry Card on Hover */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 1.2, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-150 font-sans">
            <div className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl shadow-glass-md text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-zinc-100 tracking-tight whitespace-nowrap">
                  {config.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 pl-4 whitespace-nowrap">
                {config.domain}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 pl-4 mt-1">
                Click to open orchestrator
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
