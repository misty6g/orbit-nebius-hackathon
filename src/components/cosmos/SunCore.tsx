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
 * Cinematic solar core — warm photosphere with living corona, soft prominences,
 * and subtle animated flares. Realistic vibe, not neon cartoon fire.
 */
export function SunCore({ onSelect, isSelected }: SunCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowInnerRef = useRef<THREE.Mesh>(null);
  const glowMidRef = useRef<THREE.Mesh>(null);
  const glowOuterRef = useRef<THREE.Mesh>(null);
  const limbMeshRef = useRef<THREE.Mesh>(null);
  const prominenceRef = useRef<THREE.Mesh>(null);
  const flareRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const solarTexture = useMemo(() => generateSolarTexture(), []);

  // Soft warm chromosphere limb — peach haze at the disc edge
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
        precision highp float;
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        uniform vec3 uColor;
        uniform float uStrength;
        uniform float uTime;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          float d = abs(dot(V, normalize(vNormalW)));
          float limb = pow(smoothstep(0.78, 0.06, d), 1.25);
          // Gentle breathing along the rim
          float breathe = 0.92 + 0.08 * sin(uTime * 0.4 + d * 6.0);
          float a = limb * uStrength * breathe;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#ffc890") },
        uStrength: { value: 0.48 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
  }, []);

  // Volumetric corona shells — streamers + soft bloom
  const makeGlowMaterial = (
    color: string,
    intensity: number,
    falloff: number,
    streamers: boolean
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
        precision highp float;
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        varying vec3 vDir;
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uFalloff;
        uniform float uTime;
        uniform float uStreamers;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          float rim = pow(1.0 - abs(dot(V, normalize(vNormalW))), uFalloff);
          float a = rim * uIntensity;
          if (uStreamers > 0.5) {
            float ang = atan(vDir.x, vDir.z);
            float lat = vDir.y;
            // Polar streamers denser near poles; equatorial belts quieter
            float polar = smoothstep(0.15, 0.85, abs(lat));
            float s1 = sin(ang * 14.0 + sin(lat * 8.0 + uTime * 0.15) * 1.4 + uTime * 0.09);
            float s2 = sin(ang * 7.0 - lat * 5.0 + uTime * 0.06);
            float stream = 0.72 + 0.28 * s1 * s1 + 0.12 * s2 * polar;
            a *= mix(0.88, stream, 0.55 + 0.45 * polar);
          }
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uFalloff: { value: falloff },
        uTime: { value: 0 },
        uStreamers: { value: streamers ? 1 : 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
      fog: false,
    });

  // Prominence loops — arched plasma near the limb
  const prominenceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
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
        precision highp float;
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        varying vec3 vDir;
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uIntensity;

        float hash(float n) { return fract(sin(n) * 43758.5453); }

        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          vec3 N = normalize(vNormalW);
          float rim = 1.0 - abs(dot(V, N));
          // Only near the limb
          float limbMask = smoothstep(0.35, 0.85, rim) * smoothstep(1.0, 0.72, rim);

          float ang = atan(vDir.x, vDir.z);
          float lat = vDir.y;

          // A few slow-moving prominence arches around the disc
          float prom = 0.0;
          for (int i = 0; i < 5; i++) {
            float fi = float(i);
            float seed = hash(fi * 17.13 + 2.7);
            float center = seed * 6.28318 + uTime * (0.04 + seed * 0.03);
            float dAng = abs(atan(sin(ang - center), cos(ang - center)));
            float width = 0.14 + seed * 0.1;
            float arch = exp(-pow(dAng / width, 2.0));
            // Height bias: brighter slightly off the equator
            float hBias = 0.55 + 0.45 * abs(sin(lat * 3.14159 + seed * 4.0));
            // Pulse
            float pulse = 0.75 + 0.25 * sin(uTime * (0.5 + seed) + fi * 2.1);
            prom += arch * hBias * pulse;
          }
          prom = clamp(prom * 0.55, 0.0, 1.0);

          float a = limbMask * prom * uIntensity;
          // Warm rose-amber plasma, soft not neon
          vec3 col = mix(uColor * 0.65, uColor, prom);
          gl_FragColor = vec4(col * a, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#ffb078") },
        uTime: { value: 0 },
        uIntensity: { value: 0.38 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
      fog: false,
    });
  }, []);

  // Subtle solar flares — sparse radial plumes from the limb
  const flareMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
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
        precision highp float;
        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        varying vec3 vDir;
        uniform vec3 uColorHot;
        uniform vec3 uColorWarm;
        uniform float uTime;
        uniform float uIntensity;

        float hash(float n) { return fract(sin(n) * 43758.5453); }

        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          vec3 N = normalize(vNormalW);
          float rim = 1.0 - abs(dot(V, N));
          // Flares live just outside the hard disc, fading outward
          float zone = smoothstep(0.25, 0.55, rim) * smoothstep(1.05, 0.55, rim);

          float ang = atan(vDir.x, vDir.z);
          float lat = vDir.y;

          float flares = 0.0;
          for (int i = 0; i < 4; i++) {
            float fi = float(i);
            float seed = hash(fi * 31.7 + 9.1);
            float center = seed * 6.28318 + uTime * (0.055 + 0.02 * seed);
            // Drift slowly in latitude too
            float latC = (hash(fi * 5.3) - 0.5) * 1.2 + 0.15 * sin(uTime * 0.2 + fi);
            float dAng = abs(atan(sin(ang - center), cos(ang - center)));
            float dLat = abs(lat - latC);
            // Sharp angular spike, soft lat falloff — reads as a plume
            float spike = exp(-pow(dAng / (0.045 + seed * 0.03), 1.6));
            float plume = exp(-pow(dLat / (0.22 + seed * 0.12), 2.0));
            // Occasional swell
            float swell = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(uTime * (0.35 + seed * 0.4) + fi * 3.0), 2.0);
            flares += spike * plume * swell;
          }
          flares = clamp(flares, 0.0, 1.5);

          float a = zone * flares * uIntensity;
          vec3 col = mix(uColorWarm, uColorHot, clamp(flares * 0.7, 0.0, 1.0));
          gl_FragColor = vec4(col * a, a * 0.95);
        }
      `,
      uniforms: {
        uColorHot: { value: new THREE.Color("#ffe8c8") },
        uColorWarm: { value: new THREE.Color("#f0a868") },
        uTime: { value: 0 },
        uIntensity: { value: 0.42 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
      fog: false,
    });
  }, []);

  // Peach core → amber mid → soft rose-violet outer atmospheric bloom
  const glowInnerMaterial = useMemo(
    () => makeGlowMaterial("#ffe4c4", 0.58, 2.65, true),
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const glowMidMaterial = useMemo(
    () => makeGlowMaterial("#f0b070", 0.3, 2.35, true),
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const glowOuterMaterial = useMemo(
    () => makeGlowMaterial("#c898b0", 0.11, 2.05, false),
    []
  ); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const time = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.035;
      const pulse = 1 + Math.sin(time * 0.55) * 0.008;
      meshRef.current.scale.set(pulse, pulse, pulse);
      solarTexture.offset.x = (time * 0.003) % 1;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      const breathe = 0.92 + 0.08 * Math.sin(time * 0.35);
      mat.color.setRGB(breathe, breathe * 0.98, breathe * 0.95);
    }

    limbMaterial.uniforms.uTime.value = time;

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
      glowMidMaterial.uniforms.uTime.value = time * 0.65;
    }
    if (glowOuterRef.current) {
      glowOuterRef.current.rotation.y -= delta * 0.008;
      const s = 1.0 + Math.sin(time * 0.4) * 0.022;
      glowOuterRef.current.scale.set(s, s, s);
      glowOuterMaterial.uniforms.uTime.value = time * 0.4;
    }

    if (prominenceRef.current) {
      prominenceRef.current.rotation.y += delta * 0.02;
      prominenceMaterial.uniforms.uTime.value = time;
    }
    if (flareRef.current) {
      flareRef.current.rotation.y -= delta * 0.015;
      flareMaterial.uniforms.uTime.value = time;
    }
  });

  const config = SPECIALISTS.core;
  const R = config.size;

  return (
    <group position={[0, 0, 0]}>
      {/* Warm key for the system — soft enough to keep planet nights readable */}
      <pointLight color="#f5c07a" intensity={14} distance={320} decay={1.1} />
      <pointLight color="#e8a060" intensity={4} distance={120} decay={1.25} />

      {/* Photosphere disc */}
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

      {/* Chromosphere limb bloom */}
      <mesh ref={limbMeshRef} material={limbMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.012, 64, 64]} />
      </mesh>

      {/* Prominence arches just above the limb */}
      <mesh ref={prominenceRef} material={prominenceMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.08, 72, 72]} />
      </mesh>

      {/* Sparse animated solar flare plumes */}
      <mesh ref={flareRef} material={flareMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.55, 64, 64]} />
      </mesh>

      {/* Layered corona — streamers + soft atmospheric bloom */}
      <mesh ref={glowInnerRef} material={glowInnerMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.18, 56, 56]} />
      </mesh>
      <mesh ref={glowMidRef} material={glowMidMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 1.55, 48, 48]} />
      </mesh>
      <mesh ref={glowOuterRef} material={glowOuterMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 2.25, 36, 36]} />
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
