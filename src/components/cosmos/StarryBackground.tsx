"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarryBackground() {
  const pointsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Group>(null);

  // Generate 7,000 realistic stars with varying temperatures and sizes
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = 7000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const tempPalettes = [
      new THREE.Color("#ffffff"), // Pure white
      new THREE.Color("#93c5fd"), // Blue-white (O/B type)
      new THREE.Color("#fed7aa"), // Warm amber (K/M type)
      new THREE.Color("#e0e7ff"), // Cool white
      new THREE.Color("#c7d2fe"), // Violet tint
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute stars on a wide spherical shell between radius 120 and 260
      const radius = 120 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const color = tempPalettes[Math.floor(Math.random() * tempPalettes.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 1.8 + 0.4;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.005;
      pointsRef.current.rotation.x += delta * 0.001;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y -= delta * 0.003;
    }
  });

  return (
    <group>
      {/* Distant Deep Starfield */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starPositions.length / 3}
            array={starPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starColors.length / 3}
            array={starColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Atmospheric Cosmic Nebula Gas Clouds */}
      <group ref={nebulaRef}>
        <mesh position={[-50, 20, -100]}>
          <sphereGeometry args={[70, 16, 16]} />
          <meshBasicMaterial
            color="#4f46e5"
            transparent
            opacity={0.035}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[60, -30, -120]}>
          <sphereGeometry args={[85, 16, 16]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.03}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 60, -90]}>
          <sphereGeometry args={[60, 16, 16]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.025}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
