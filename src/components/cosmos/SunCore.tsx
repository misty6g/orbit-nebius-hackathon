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
  const flareCount = 60;
  const flarePositions = React.useMemo(() => {
    const pos = new Float32Array(flareCount * 3);
    for (let i = 0; i < flareCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.4 + Math.random() * 0.8;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      // Gentle solar pulse
      const scale = 1 + Math.sin(time * 1.5) * 0.02;
      meshRef.current.scale.set(scale, scale, scale);
    }

    if (coronaRef.current) {
      coronaRef.current.rotation.z -= delta * 0.08;
      const coronaScale = 1.15 + Math.sin(time * 2.2) * 0.04;
      coronaRef.current.scale.set(coronaScale, coronaScale, coronaScale);
    }

    if (outerCoronaRef.current) {
      outerCoronaRef.current.rotation.y += delta * 0.05;
      const outerScale = 1.35 + Math.cos(time * 1.8) * 0.06;
      outerCoronaRef.current.scale.set(outerScale, outerScale, outerScale);
    }

    if (flaresRef.current) {
      flaresRef.current.rotation.y += delta * 0.25;
      flaresRef.current.rotation.x += delta * 0.1;
    }
  });

  const config = SPECIALISTS.core;

  return (
    <group position={[0, 0, 0]}>
      {/* Central Omnidirectional Light from the Sun */}
      <pointLight color="#fed7aa" intensity={2.8} distance={120} decay={1.2} />
      <pointLight color="#fbbf24" intensity={1.5} distance={40} decay={1} />

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
        <sphereGeometry args={[config.size, 32, 32]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.8}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Inner Radiant Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[config.size * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.35}
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
          opacity={0.18}
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
          size={0.18}
          color="#fde047"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Holographic Telemetry Label on Hover or Active */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 1.2, 0]} center distanceFactor={14}>
          <div className="pointer-events-none px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 shadow-solar-glow text-center whitespace-nowrap transition-all duration-300">
            <div className="text-xs font-display font-semibold text-amber-200 tracking-wide">
              {config.name}
            </div>
            <div className="text-[10px] font-mono text-amber-400/80 uppercase">
              {config.domain}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
