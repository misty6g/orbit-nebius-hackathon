"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarryBackground() {
  const pointsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Group>(null);

  // Generate 6,500 pinpoint stars with fine astronomical scale
  const [starPositions, starColors, starSizes] = useMemo(() => {
    const count = 6500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const tempPalettes = [
      new THREE.Color("#ffffff"), // Pure white
      new THREE.Color("#dbeafe"), // Subtle cool white
      new THREE.Color("#fed7aa"), // Warm star
      new THREE.Color("#e2e8f0"), // Slate white
      new THREE.Color("#f1f5f9"), // Bright point
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute stars on a wide spherical shell
      const radius = 100 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const color = tempPalettes[Math.floor(Math.random() * tempPalettes.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Fine pinprick stars matching the user's reference image
      sizes[i] = Math.random() * 1.3 + 0.3;
    }

    return [positions, colors, sizes];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.003;
      pointsRef.current.rotation.x += delta * 0.0008;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y -= delta * 0.0015;
    }
  });

  return (
    <group>
      {/* Distant Pinprick Starfield */}
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
          size={1.0}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Muted Atmospheric Nebula Smoke Clouds (Organic billowy puffs matching reference placement, desaturated per user request) */}
      <group ref={nebulaRef}>
        {/* Soft Muted Teal Smoke Cloud Cluster (Lower left) */}
        <group position={[-38, -18, -65]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[42, 24, 24]} />
            <meshBasicMaterial
              color="#0c2624"
              transparent
              opacity={0.032}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-12, 8, -10]}>
            <sphereGeometry args={[30, 20, 20]} />
            <meshBasicMaterial
              color="#082020"
              transparent
              opacity={0.025}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[10, -6, 8]}>
            <sphereGeometry args={[26, 20, 20]} />
            <meshBasicMaterial
              color="#0a2a26"
              transparent
              opacity={0.022}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Soft Muted Rust/Maroon Smoke Cloud Cluster (Upper right) */}
        <group position={[42, 24, -75]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[52, 24, 24]} />
            <meshBasicMaterial
              color="#2a1411"
              transparent
              opacity={0.03}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[12, -10, -8]}>
            <sphereGeometry args={[38, 20, 20]} />
            <meshBasicMaterial
              color="#22100e"
              transparent
              opacity={0.024}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[-8, 14, 10]}>
            <sphereGeometry args={[32, 20, 20]} />
            <meshBasicMaterial
              color="#321814"
              transparent
              opacity={0.02}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Deep Slate Space Ambient Fill */}
        <mesh position={[0, 0, -105]}>
          <sphereGeometry args={[85, 20, 20]} />
          <meshBasicMaterial
            color="#090d14"
            transparent
            opacity={0.02}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
