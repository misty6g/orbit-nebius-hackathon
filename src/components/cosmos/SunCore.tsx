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
  const limbMeshRef = useRef<THREE.Mesh>(null);
  const coronaBillboardRef = useRef<THREE.Mesh>(null);
  const flareBillboardRef = useRef<THREE.Mesh>(null);
  const glowSoftRef = useRef<THREE.Mesh>(null);
  const flareRollRef = useRef(0);
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
          float limb = pow(smoothstep(0.85, 0.02, d), 1.1);
          float breathe = 0.9 + 0.1 * sin(uTime * 0.4 + d * 6.0);
          float a = limb * uStrength * breathe;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#ffd2a4") },
        uStrength: { value: 0.78 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
  }, []);

  // Camera-facing corona disc — streamers + soft halo (reads as atmosphere, not shells)
  const coronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorOuter;
        uniform float uTime;
        uniform float uIntensity;

        float hash(float n) { return fract(sin(n) * 43758.5453); }

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0) discard;

          float ang = atan(p.y, p.x);
          // Soft radial falloff — hole for the photosphere disc (~r=0.385 at limb)
          float discHole = smoothstep(0.37, 0.44, r);
          float outerFade = 1.0 - smoothstep(0.58, 1.0, r);
          float halo = discHole * outerFade;

          // Coronal streamers — irregular rays with polar preference
          float stream = 0.0;
          for (int i = 0; i < 8; i++) {
            float fi = float(i);
            float seed = hash(fi * 13.7 + 1.3);
            float center = seed * 6.28318 + uTime * (0.03 + 0.02 * seed);
            float dAng = abs(atan(sin(ang - center), cos(ang - center)));
            float width = 0.1 + seed * 0.1;
            float ray = exp(-pow(dAng / width, 1.55));
            // Longer near poles of the billboard (approx solar poles when upright)
            float polar = 0.55 + 0.45 * abs(sin(ang));
            float lengthBias = smoothstep(0.42, 0.95, r);
            float pulse = 0.7 + 0.3 * sin(uTime * (0.35 + seed * 0.5) + fi);
            stream += ray * polar * lengthBias * pulse;
          }
          stream = clamp(stream * 0.55, 0.0, 1.2);

          // Soft base corona under the rays — keep gaps so rays read as streamers
          float base = pow(halo, 1.45) * 0.42;
          float rays = pow(halo, 0.75) * stream;
          float a = (base + rays) * uIntensity;

          vec3 col = mix(uColorOuter, uColorMid, smoothstep(0.92, 0.48, r));
          col = mix(col, uColorCore, clamp(rays * 0.9, 0.0, 1.0));
          gl_FragColor = vec4(col * a, a);
        }
      `,
      uniforms: {
        uColorCore: { value: new THREE.Color("#fff1d4") },
        uColorMid: { value: new THREE.Color("#f0a868") },
        uColorOuter: { value: new THREE.Color("#c87858") },
        uTime: { value: 0 },
        uIntensity: { value: 1.05 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    });
  }, []);

  // Camera-facing flare + prominence layer — arched plasma and sparse plumes
  const flareMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform vec3 uColorHot;
        uniform vec3 uColorWarm;
        uniform float uTime;
        uniform float uIntensity;

        float hash(float n) { return fract(sin(n) * 43758.5453); }

        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0) discard;

          float ang = atan(p.y, p.x);
          // Live just outside the photosphere (~r=0.455 at limb on this plane)
          float zone = smoothstep(0.44, 0.52, r) * (1.0 - smoothstep(0.78, 0.99, r));

          // Prominence arches — short curved lobes near the limb
          float prom = 0.0;
          for (int i = 0; i < 7; i++) {
            float fi = float(i);
            float seed = hash(fi * 19.1 + 4.2);
            float center = seed * 6.28318 + uTime * (0.04 + seed * 0.025);
            float dAng = abs(atan(sin(ang - center), cos(ang - center)));
            float width = 0.14 + seed * 0.1;
            float arch = exp(-pow(dAng / width, 1.85));
            // Loop-like radial profile: rise then fall (arched prominence)
            float rr = (r - 0.48) / 0.14;
            float loop = exp(-pow(rr - 0.55, 2.0) * 3.2) * smoothstep(0.0, 0.25, rr);
            float pulse = 0.65 + 0.35 * sin(uTime * (0.4 + seed) + fi * 1.7);
            prom += arch * loop * pulse;
          }
          prom = clamp(prom * 0.85, 0.0, 1.0);

          // Longer wispy flare plumes (narrower than light-shafts)
          float flares = 0.0;
          for (int i = 0; i < 6; i++) {
            float fi = float(i);
            float seed = hash(fi * 27.3 + 8.8);
            float center = seed * 6.28318 + uTime * (0.05 + 0.02 * seed);
            float dAng = abs(atan(sin(ang - center), cos(ang - center)));
            float spike = exp(-pow(dAng / (0.045 + seed * 0.03), 1.55));
            // Soft filament noise along the plume
            float filament = 0.75 + 0.25 * sin(r * 28.0 + ang * 6.0 + uTime * 0.6 + fi);
            float stretch = smoothstep(0.46, 0.56, r) * (1.0 - smoothstep(0.68, 0.98, r));
            float swell = 0.4 + 0.6 * pow(0.5 + 0.5 * sin(uTime * (0.28 + seed * 0.45) + fi * 2.4), 2.2);
            flares += spike * stretch * swell * filament;
          }
          flares = clamp(flares, 0.0, 1.6);

          float a = zone * (prom * 1.05 + flares * 0.95) * uIntensity;
          if (a < 0.004) discard;
          vec3 col = mix(uColorWarm, uColorHot, clamp(flares * 0.55 + prom * 0.45, 0.0, 1.0));
          gl_FragColor = vec4(col * a, a);
        }
      `,
      uniforms: {
        uColorHot: { value: new THREE.Color("#fff2d8") },
        uColorWarm: { value: new THREE.Color("#f4a060") },
        uTime: { value: 0 },
        uIntensity: { value: 1.25 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide,
    });
  }, []);

  // Very soft volumetric outer wash (low falloff — no hard shell ring)
  const softGlowMaterial = useMemo(() => {
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
        uniform float uIntensity;
        void main() {
          vec3 V = normalize(cameraPosition - vWorldPos);
          float rim = pow(1.0 - abs(dot(V, normalize(vNormalW))), 1.55);
          float a = rim * uIntensity;
          gl_FragColor = vec4(uColor * a, a);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color("#e09868") },
        uIntensity: { value: 0.2 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
      fog: false,
    });
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const cam = state.camera;

    if (!reducedMotion && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.035;
      const pulse = 1 + Math.sin(time * 0.55) * 0.008;
      meshRef.current.scale.set(pulse, pulse, pulse);
      solarTexture.offset.x = (time * 0.003) % 1;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      const breathe = 0.92 + 0.08 * Math.sin(time * 0.35);
      mat.color.setRGB(breathe, breathe * 0.98, breathe * 0.95);
    }

    limbMaterial.uniforms.uTime.value = time;
    coronaMaterial.uniforms.uTime.value = time;
    flareMaterial.uniforms.uTime.value = time;

    // Billboard corona + flares toward camera
    if (coronaBillboardRef.current) {
      coronaBillboardRef.current.quaternion.copy(cam.quaternion);
      if (!reducedMotion) {
        const s = 1 + Math.sin(time * 0.45) * 0.015;
        coronaBillboardRef.current.scale.setScalar(s);
      }
    }
    if (flareBillboardRef.current) {
      flareBillboardRef.current.quaternion.copy(cam.quaternion);
      // Slow roll in camera space so plumes drift without fighting look-at
      if (!reducedMotion) {
        flareRollRef.current += delta * 0.012;
      }
      flareBillboardRef.current.rotateZ(flareRollRef.current);
    }
    if (glowSoftRef.current && !reducedMotion) {
      glowSoftRef.current.rotation.y -= delta * 0.01;
      const s = 1 + Math.sin(time * 0.35) * 0.02;
      glowSoftRef.current.scale.set(s, s, s);
    }
  });

  const config = SPECIALISTS.core;
  const R = config.size;

  return (
    <group position={[0, 0, 0]}>
      {/* Warm key for the system — soft enough to keep planet nights readable */}
      <pointLight color="#f5c07a" intensity={14} distance={320} decay={1.1} />
      <pointLight color="#e8a060" intensity={4} distance={120} decay={1.25} />

      {/* Soft outer atmospheric wash */}
      <mesh ref={glowSoftRef} material={softGlowMaterial} raycast={() => null}>
        <sphereGeometry args={[R * 2.4, 40, 40]} />
      </mesh>

      {/* Camera-facing corona streamers */}
      <mesh ref={coronaBillboardRef} material={coronaMaterial} raycast={() => null}>
        <planeGeometry args={[R * 5.2, R * 5.2]} />
      </mesh>

      {/* Camera-facing prominences + flare plumes */}
      <mesh ref={flareBillboardRef} material={flareMaterial} raycast={() => null}>
        <planeGeometry args={[R * 4.4, R * 4.4]} />
      </mesh>

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
        <sphereGeometry args={[R * 1.015, 64, 64]} />
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
