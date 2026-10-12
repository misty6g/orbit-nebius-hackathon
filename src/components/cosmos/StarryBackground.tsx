"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Near-black pinprick starfield: three sharp layers, no glow sprites,
 * static buffers with only a faint group rotation (no per-frame CPU work).
 */
export function StarryBackground() {
  const microStarsRef = useRef<THREE.Points>(null);
  const clusterStarsRef = useRef<THREE.Points>(null);
  const brightStarsRef = useRef<THREE.Points>(null);

  // 1. Vast faint pinprick field (14,000 stars, sizes ~0.4-1.2)
  const [microPositions, microColors] = useMemo(() => {
    const count = 14000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const spectralColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#f0f9ff"),
      new THREE.Color("#e0f2fe"),
      new THREE.Color("#fef9c3"),
      new THREE.Color("#ffedd5"),
      new THREE.Color("#bae6fd"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 100 + Math.random() * 160;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const col = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      // Dim the field so the backdrop stays near-black.
      const dim = 0.35 + Math.random() * 0.45;
      colors[i3] = col.r * dim;
      colors[i3 + 1] = col.g * dim;
      colors[i3 + 2] = col.b * dim;
    }

    return [positions, colors];
  }, []);

  // 2. Galactic star river (3,500 stars along an inclined plane)
  const [clusterPositions, clusterColors] = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const clusterPalette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#e0f2fe"),
      new THREE.Color("#fef08a"),
      new THREE.Color("#bae6fd"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = (Math.random() - 0.5) * Math.PI * 2;
      const radius = 110 + Math.random() * 90;
      const diskSpread = (Math.random() - 0.5) * 35;

      const cosInc = Math.cos(0.45);
      const sinInc = Math.sin(0.45);

      const px = Math.cos(t) * radius;
      const py = diskSpread;
      const pz = Math.sin(t) * radius;

      positions[i3] = px;
      positions[i3 + 1] = py * cosInc - pz * sinInc;
      positions[i3 + 2] = py * sinInc + pz * cosInc;

      const col = clusterPalette[Math.floor(Math.random() * clusterPalette.length)];
      const dim = 0.3 + Math.random() * 0.4;
      colors[i3] = col.r * dim;
      colors[i3 + 1] = col.g * dim;
      colors[i3 + 2] = col.b * dim;
    }

    return [positions, colors];
  }, []);

  // 3. Sparse brighter anchors (350 stars, still pinprick-sharp)
  const [brightPositions, brightColors] = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const anchorColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#7dd3fc"),
      new THREE.Color("#fef08a"),
      new THREE.Color("#fed7aa"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 95 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const col = anchorColors[Math.floor(Math.random() * anchorColors.length)];
      const dim = 0.55 + Math.random() * 0.45;
      colors[i3] = col.r * dim;
      colors[i3 + 1] = col.g * dim;
      colors[i3 + 2] = col.b * dim;
    }

    return [positions, colors];
  }, []);

  useFrame((_, delta) => {
    // Tiny rotation only — no per-frame attribute updates.
    if (microStarsRef.current) {
      microStarsRef.current.rotation.y += delta * 0.002;
    }
    if (clusterStarsRef.current) {
      clusterStarsRef.current.rotation.y += delta * 0.0025;
    }
    if (brightStarsRef.current) {
      brightStarsRef.current.rotation.y += delta * 0.0015;
    }
  });

  return (
    <group>
      {/* 1. Vast pinprick starfield (14,000 stars) */}
      <points ref={microStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={microPositions.length / 3}
            array={microPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={microColors.length / 3}
            array={microColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.55}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Galactic star river (3,500 stars) */}
      <points ref={clusterStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={clusterPositions.length / 3}
            array={clusterPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={clusterColors.length / 3}
            array={clusterColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.7}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Sparse brighter anchors (350 stars) */}
      <points ref={brightStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={brightPositions.length / 3}
            array={brightPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={brightColors.length / 3}
            array={brightColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.2}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
