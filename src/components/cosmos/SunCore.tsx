"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SPECIALISTS } from "@/lib/specialists";

interface SunCoreProps {
  onSelect: () => void;
  isSelected: boolean;
}

export function SunCore({ onSelect, isSelected }: SunCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const outerCoronaRef = useRef<THREE.Mesh>(null);
  const flaresRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);

  // Generate flare particles
  const flareCount = 70;
  const flarePositions = React.useMemo(() => {
    const pos = new Float32Array(flareCount * 3);
    for (let i = 0; i < flareCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.6 + Math.random() * 0.9;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
      // Gentle solar pulse
      const scale = 1 + Math.sin(time * 1.4) * 0.02;
      meshRef.current.scale.set(scale, scale, scale);
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.z -= delta * 0.06;
      const coronaScale = 1.15 + Math.sin(time * 2.0) * 0.03;
      coronaRef.current.scale.set(coronaScale, coronaScale, coronaScale);
    }

    if (outerCoronaRef.current) {
      outerCoronaRef.current.rotation.y += delta * 0.04;
      const outerScale = 1.35 + Math.cos(time * 1.6) * 0.04;
      outerCoronaRef.current.scale.set(outerScale, outerScale, outerScale);
    }

    if (flaresRef.current) {
      flaresRef.current.rotation.y += delta * 0.2;
      flaresRef.current.rotation.x += delta * 0.08;
    }
  });

  const config = SPECIALISTS.core;

  return (
    <group position={[0, 0, 0]}>
      {/* Central Solar Point Light */}
      <pointLight color="#fed7aa" intensity={2.6} distance={100} decay={1.1} />
      <pointLight color="#fbbf24" intensity={1.4} distance={35} decay={1} />

      {/* Main Solar Sphere */}
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
        <sphereGeometry args={[config.size, 48, 48]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.9}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* Inner Radiant Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[config.size * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.32}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Ethereal Atmosphere */}
      <mesh ref={outerCoronaRef}>
        <sphereGeometry args={[config.size * 1.25, 32, 32]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Solar Flare Particles */}
      <points ref={flaresRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={flarePositions.length / 3}
            array={flarePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#fde047"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Prominent, Ultra-Readable Zen Core Hover Badge */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 1.4, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-200">
            <div
              className="px-4 py-2.5 rounded-2xl border text-left shadow-2xl backdrop-blur-2xl"
              style={{
                backgroundColor: "rgba(9, 10, 13, 0.95)",
                borderColor: "rgba(251, 191, 36, 0.4)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7), 0 0 25px rgba(251, 191, 36, 0.25)",
              }}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm animate-pulse shrink-0" />
                <span className="text-sm font-display font-semibold text-amber-200 tracking-wide whitespace-nowrap">
                  {config.name}
                </span>
              </div>
              <div className="text-[11px] font-mono text-amber-400/80 uppercase tracking-wider pl-4 whitespace-nowrap">
                {config.domain}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 pl-4 mt-1 flex items-center gap-1">
                <span>Click to enter core cockpit</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
