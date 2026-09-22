"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarryBackground() {
  const microStarsRef = useRef<THREE.Points>(null);
  const brightStarsRef = useRef<THREE.Points>(null);
  const clusterStarsRef = useRef<THREE.Points>(null);

  // Circular star texture with soft optical glow
  const starGlowTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.12, "rgba(240, 248, 255, 0.95)");
    grad.addColorStop(0.35, "rgba(200, 225, 255, 0.4)");
    grad.addColorStop(0.7, "rgba(180, 210, 255, 0.08)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 1. Vast dense starry field (14,000 brilliant diamond stars)
  const [microPositions, microColors, microSizes] = useMemo(() => {
    const count = 14000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Realistic stellar spectral temperatures (brilliant, crisp, luminous)
    const spectralColors = [
      new THREE.Color("#ffffff"), // Pure radiant white
      new THREE.Color("#f0f9ff"), // Crisp ice-white
      new THREE.Color("#e0f2fe"), // Brilliant azure
      new THREE.Color("#fef9c3"), // Warm solar yellow
      new THREE.Color("#ffedd5"), // Light starlight amber
      new THREE.Color("#bae6fd"), // Vibrant cyan star
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
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      // Varied star brightness
      sizes[i] = 0.5 + Math.random() * 1.0;
    }

    return [positions, colors, sizes];
  }, []);

  // 2. Dense star cluster clouds (Milky Way stellar river, 3,500 stars along a galactic arch)
  const [clusterPositions, clusterColors, clusterSizes] = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const clusterPalette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#e0f2fe"),
      new THREE.Color("#fef08a"),
      new THREE.Color("#bae6fd"),
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Clustered along an inclined galactic plane
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
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      sizes[i] = 0.8 + Math.random() * 1.2;
    }

    return [positions, colors, sizes];
  }, []);

  // 3. Bright twinkling anchor beacons (350 prominent sparkling stars)
  const [brightPositions, brightColors, brightSizes, twinklePhases] = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    const anchorColors = [
      new THREE.Color("#ffffff"), // Pure radiant diamond
      new THREE.Color("#7dd3fc"), // Vivid sapphire beacon
      new THREE.Color("#fef08a"), // Brilliant solar beacon
      new THREE.Color("#fed7aa"), // Warm amber beacon
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
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      sizes[i] = 2.2 + Math.random() * 2.0;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return [positions, colors, sizes, phases];
  }, []);

  useFrame((_, delta) => {
    // Subtle cosmic rotation
    if (microStarsRef.current) {
      microStarsRef.current.rotation.y += delta * 0.002;
    }
    if (clusterStarsRef.current) {
      clusterStarsRef.current.rotation.y += delta * 0.0025;
    }

    // Dynamic stellar twinkle for prominent anchor stars
    if (brightStarsRef.current) {
      const time = performance.now() * 0.001;
      const sizeAttr = brightStarsRef.current.geometry.attributes.size;
      if (sizeAttr) {
        for (let i = 0; i < brightSizes.length; i++) {
          const phase = twinklePhases[i];
          const twinkle = 0.8 + 0.45 * Math.sin(time * 2.8 + phase);
          sizeAttr.setX(i, brightSizes[i] * twinkle);
        }
        sizeAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* 1. Vast Brilliant Diamond Starfield (14,000 stars) */}
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
          <bufferAttribute
            attach="attributes-size"
            count={microSizes.length}
            array={microSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          map={starGlowTexture || undefined}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Galactic Star River / Clusters (3,500 dense stars) */}
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
          <bufferAttribute
            attach="attributes-size"
            count={clusterSizes.length}
            array={clusterSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.4}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          map={starGlowTexture || undefined}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Prominent Twinkling Diamond Anchor Stars (350 stars) */}
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
          <bufferAttribute
            attach="attributes-size"
            count={brightSizes.length}
            array={brightSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2.4}
          sizeAttenuation
          vertexColors
          transparent
          opacity={1.0}
          map={starGlowTexture || undefined}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
