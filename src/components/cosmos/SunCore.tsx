"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SPECIALISTS } from "@/lib/specialists";
import { generateSolarTexture } from "@/lib/zenPlanetTextures";

interface SunCoreProps {
  onSelect: () => void;
  isSelected: boolean;
}

/**
 * Soft cinematic Zen sun — atmospheric amber presence with elegant corona,
 * not a harsh photoreal fireball. Still clearly the system’s luminous core.
 */
export function SunCore({ onSelect, isSelected }: SunCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowInnerRef = useRef<THREE.Mesh>(null);
  const glowMidRef = useRef<THREE.Mesh>(null);
  const glowOuterRef = useRef<THREE.Mesh>(null);
  const limbMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const solarTexture = useMemo(() => generateSolarTexture(), []);

  // Soft warm limb — peach haze, never a neon ring
  const limbMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        uniform vec3 uColor;
        uniform float uStrength;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          float d = abs(dot(V, normalize(vNormalW)));
          float limb = pow(smoothstep(0.75, 0.08, d), 1.35);
          gl_FragColor = vec4(uColor, limb * uStrength);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#ffc58a") },
        uStrength: { value: 0.42 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
  }, []);

  // Soft volumetric corona shells — cinematic bloom without postprocessing
  const makeGlowMaterial = (
    color: string,
    intensity: number,
    falloff: number,
    filament = false
  ) =>
    new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        varying vec3 vDir;
        void main() {
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vDir = normalize(position);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        varying vec3 vDir;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uFalloff;
        uniform float uTime;
        uniform float uFilament;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          float rim = pow(1.0 - abs(dot(V, normalize(vNormalW))), uFalloff);
          float a = rim * uIntensity;
          if (uFilament > 0.5) {
            float ang = atan(vDir.x, vDir.z);
            float filaments = 0.82 + 0.18 * sin(
              ang * 18.0 + sin(vDir.y * 10.0 + uTime * 0.12) * 1.2 + uTime * 0.08
            );
            a *= filaments;
          }
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uFalloff: { value: falloff },
        uTime: { value: 0 },
        uFilament: { value: filament ? 1 : 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
      fog: false,
    });

  // Peach core glow → soft amber mid → rose-violet outer atmospheric bloom
  const glowInnerMaterial = useMemo(
    () => makeGlowMaterial("#ffe4c4", 0.55, 2.8, true),
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const glowMidMaterial = useMemo(
    () => makeGlowMaterial("#f0b070", 0.28, 2.4, false),
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const glowOuterMaterial = useMemo(
    () => makeGlowMaterial("#d4a0c0", 0.12, 2.1, false),
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      // Elegant slow spin — Zen, not turbulent churn
      meshRef.current.rotation.y += delta * 0.035;
      const pulse = 1 + Math.sin(time * 0.55) * 0.008;
      meshRef.current.scale.set(pulse, pulse, pulse);
      solarTexture.offset.x = (time * 0.003) % 1;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      // Soft breathing emissive feel via opacity-equivalent brightness on color
      const breathe = 0.92 + 0.08 * Math.sin(time * 0.35);
      mat.color.setRGB(breathe, breathe * 0.98, breathe * 0.95);
    }

    if (glowInnerRef.current) {
      glowInnerRef.current.rotation.z -= delta * 0.018;
      const s = 1.0 + Math.sin(time * 0.7) * 0.012;
      glowInnerRef.current.scale.set(s, s, s);
      glowInnerMaterial.uniforms.uTime.value = time;
    }
    if (glowMidRef.current) {
      glowMidRef.current.rotation.y += delta * 0.012;
      const s = 1.0 + Math.cos(time * 0.5) * 0.018;
      glowMidRef.current.scale.set(s, s, s);
      glowMidMaterial.uniforms.uTime.value = time * 0.6;
    }
    if (glowOuterRef.current) {
      glowOuterRef.current.rotation.y -= delta * 0.008;
      const s = 1.0 + Math.sin(time * 0.4) * 0.022;
      glowOuterRef.current.scale.set(s, s, s);
      glowOuterMaterial.uniforms.uTime.value = time * 0.4;
    }
  });

  const config = SPECIALISTS.core;
  const R = config.size;

  return (
    <group position={[0, 0, 0]}>
      {/* Warm key for the system — soft enough to keep planet nights ~0.7× */}
      <pointLight color="#f5c07a" intensity={14} distance={320} decay={1.1} />
      <pointLight color="#e8a060" intensity={4} distance={120} decay={1.25} />

      {/* Soft luminous disc — MeshBasic so it reads as atmospheric glow, not PBR fireball */}
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
        <sphereGeometry args={[R, 80, 80]} />
        <meshBasicMaterial
          map={solarTexture}
          color="#fff2e0"
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* Soft peach limb bloom */}
      <mesh ref={limbMeshRef} material={limbMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.01, 64, 64]} />
      </mesh>

      {/* Layered cinematic corona — elegant atmospheric presence */}
      <mesh ref={glowInnerRef} material={glowInnerMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.12, 48, 48]} />
      </mesh>
      <mesh ref={glowMidRef} material={glowMidMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.45, 40, 40]} />
      </mesh>
      <mesh ref={glowOuterRef} material={glowOuterMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 2.1, 32, 32]} />
      </mesh>

      {(hovered || isSelected) && (
        <Html position={[0, R + 1.2, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-150 font-sans">
            <div className="px-3.5 py-2.5 rounded-xl border border-white/5 bg-[rgba(10,10,20,0.6)] backdrop-blur-2xl shadow-zen-dock text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-300/90 shrink-0" />
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
