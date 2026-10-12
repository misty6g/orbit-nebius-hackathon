"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  SpecialistConfig,
  SpecialistId,
  PlanetCustomization,
  PlanetArchetype,
  DEFAULT_PLANET_CUSTOMIZATIONS,
  normalizePlanetCustomization,
} from "@/types/orbit";
import {
  generateExoplanetTextures,
  generateExoplanetRingTexture,
} from "@/lib/exoplanetTextures";
import {
  createNightFillMaterial,
  createDayBoostMaterial,
  NIGHT_FLOOR,
} from "@/lib/softPlanetLighting";

export interface AlienPlanetProps {
  config: SpecialistConfig;
  initialAngle: number;
  onSelect: (id: SpecialistId) => void;
  isSelected: boolean;
  onPositionUpdate?: (id: SpecialistId, pos: THREE.Vector3) => void;
  customization?: PlanetCustomization;
  size?: number;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    atmosphere?: string;
  };
  archetype?: PlanetArchetype;
  hasClouds?: boolean;
  atmosphereColor?: string;
  bumpScale?: number;
  roughness?: number;
}

const FRESNEL_VERTEX = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRESNEL_FRAGMENT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  uniform vec3 uColor;
  uniform float uIntensity;
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 N = normalize(vNormalW);
    vec3 sunDir = normalize(-vWorldPos + vec3(0.0001));
    float NdotL = clamp(dot(N, sunDir), 0.0, 1.0);
    // Soft wispy mist on the sunlit limb — wraps slightly, never a neon ring.
    float lit = smoothstep(-0.12, 0.7, NdotL);
    float rim = pow(1.0 - abs(dot(V, N)), 2.8);
    float wrap = pow(max(0.0, 1.0 - abs(dot(V, N))), 1.5) * lit * 0.28;
    float a = (rim * lit * 0.7 + wrap) * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const ARCHETYPE_LABEL: Record<PlanetArchetype, string> = {
  rocky: "rocky world",
  oceanic: "ocean world",
  gas_giant: "gas giant",
  ice_giant: "ice giant",
  volcanic: "volcanic",
};

/**
 * Soft-lit cinematic exoplanet. Studio customization drives albedo, mist,
 * clouds, and rings. Night fill ≈ 0.7× day via dual-layer materials.
 */
export function AlienPlanet({
  config,
  initialAngle,
  onSelect,
  isSelected,
  onPositionUpdate,
  customization,
  size: sizeProp,
  palette,
  archetype: archetypeProp,
  hasClouds: hasCloudsProp,
  atmosphereColor,
  bumpScale,
  roughness,
}: AlienPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh>(null);
  const dayBoostMeshRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<Array<THREE.Group | null>>([]);
  const moonAngles = useRef<number[]>([]);

  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(initialAngle);
  const currentScaleRef = useRef(1.0);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  const custom = useMemo(() => {
    const fallback =
      DEFAULT_PLANET_CUSTOMIZATIONS[config.id] ||
      ({
        id: config.id,
        archetype: "rocky" as const,
        primaryColor: config.color,
        secondaryColor: config.glowColor,
        accentColor: "#c8b8a0",
        bumpScale: 0.2,
        roughness: 0.9,
        atmosphereIntensity: 0.45,
        cloudCover: 0.2,
        chromaMute: 0.4,
        hasRings: false,
        ringStyle: "none" as const,
        ringColor: config.color,
        ringTilt: 0.15,
        moons: [],
      } satisfies PlanetCustomization);

    const base = normalizePlanetCustomization(customization, fallback);

    return {
      ...base,
      ...(palette?.primary ? { primaryColor: palette.primary } : null),
      ...(palette?.secondary ? { secondaryColor: palette.secondary } : null),
      ...(palette?.accent ? { accentColor: palette.accent } : null),
      ...(archetypeProp ? { archetype: archetypeProp } : null),
      ...(bumpScale != null ? { bumpScale } : null),
      ...(roughness != null ? { roughness } : null),
    };
  }, [
    customization,
    config.id,
    config.color,
    config.glowColor,
    palette,
    archetypeProp,
    bumpScale,
    roughness,
  ]);

  const radius = sizeProp ?? config.size;
  const atmoColor =
    atmosphereColor || palette?.atmosphere || custom.secondaryColor;
  const badgePrimary = palette?.primary || custom.primaryColor;
  const archetype = custom.archetype;
  const atmoIntensity = custom.atmosphereIntensity ?? 0.45;
  const cloudCover = custom.cloudCover ?? 0.2;

  const wantsClouds =
    hasCloudsProp ??
    (cloudCover > 0.08 &&
      (archetype === "oceanic" ||
        archetype === "ice_giant" ||
        archetype === "gas_giant" ||
        archetype === "rocky"));

  // Studio-driven procedural albedo for every specialist (including Move).
  const textures = useMemo(() => generateExoplanetTextures(custom), [custom]);

  const nightFillMaterial = useMemo(
    () => createNightFillMaterial(textures.colorMap, NIGHT_FLOOR),
    [textures.colorMap]
  );
  const dayBoostMaterial = useMemo(
    () => createDayBoostMaterial(textures.colorMap, NIGHT_FLOOR),
    [textures.colorMap]
  );

  useEffect(() => {
    return () => {
      nightFillMaterial.dispose();
      dayBoostMaterial.dispose();
    };
  }, [nightFillMaterial, dayBoostMaterial]);

  const softClouds = useMemo(() => {
    if (!wantsClouds || cloudCover < 0.05) return null;
    if (typeof window === "undefined") return null;

    const w = 1024;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const tint = new THREE.Color(custom.accentColor || "#d8e0e8");
    tint.lerp(new THREE.Color("#e8eef4"), 0.35);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const n =
          Math.sin(u * 14.7 + v * 7.3) * 0.45 +
          Math.sin(u * 31.2 - v * 18.1) * 0.28 +
          Math.sin((u + v) * 48.0) * 0.18;
        const cover = Math.max(0, Math.min(1, (n + 0.25) * 0.5 * cloudCover));
        const i = (y * w + x) * 4;
        d[i] = Math.round(tint.r * 255);
        d[i + 1] = Math.round(tint.g * 255);
        d[i + 2] = Math.round(tint.b * 255);
        d[i + 3] = Math.round(cover * 150);
      }
    }
    ctx.putImageData(img, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = THREE.RepeatWrapping;
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.needsUpdate = true;
    return map;
  }, [wantsClouds, cloudCover, custom.accentColor]);

  const ringTexture = useMemo(() => {
    if (custom.hasRings && custom.ringStyle !== "none") {
      return generateExoplanetRingTexture(custom.ringStyle, custom.ringColor);
    }
    return null;
  }, [custom.hasRings, custom.ringStyle, custom.ringColor]);

  const moonTextures = useMemo(
    () =>
      custom.moons.map((moon) =>
        generateExoplanetTextures({
          id: config.id,
          archetype: "rocky",
          primaryColor: new THREE.Color(moon.color).multiplyScalar(0.5).getStyle(),
          secondaryColor: moon.color,
          accentColor: "#d0c8bc",
          bumpScale: 0.08,
          roughness: 0.95,
          atmosphereIntensity: 0.1,
          cloudCover: 0,
          chromaMute: 0.5,
          hasRings: false,
          ringStyle: "none",
          ringColor: moon.color,
          ringTilt: 0,
          moons: [],
        })
      ),
    [custom.moons, config.id]
  );

  const fresnelMaterial = useMemo(() => {
    const tint = new THREE.Color(atmoColor).lerp(new THREE.Color("#7ab8b4"), 0.4);
    tint.lerp(new THREE.Color("#d4b890"), 0.12);
    return new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX,
      fragmentShader: FRESNEL_FRAGMENT,
      uniforms: {
        uColor: { value: tint },
        uIntensity: { value: 0.35 + atmoIntensity * 0.45 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      fog: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_state, delta) => {
    const speedMult = hovered ? 0.03 : 0.09;
    angleRef.current += delta * config.orbitSpeed * speedMult;

    const x = Math.cos(angleRef.current) * config.orbitRadius;
    const z = Math.sin(angleRef.current) * config.orbitRadius;

    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      if (onPositionUpdate) {
        groupRef.current.getWorldPosition(tempVec);
        onPositionUpdate(config.id, tempVec);
      }
    }

    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y +=
        delta * (archetype === "gas_giant" || archetype === "ice_giant" ? 0.32 : 0.2);
      if (dayBoostMeshRef.current) {
        dayBoostMeshRef.current.rotation.copy(planetMeshRef.current.rotation);
      }
    }

    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += delta * 0.07;
    }

    fresnelMaterial.uniforms.uColor.value
      .set(atmoColor)
      .lerp(new THREE.Color("#7ab8b4"), 0.4)
      .lerp(new THREE.Color("#d4b890"), 0.12);
    const baseGlow = 0.28 + atmoIntensity * 0.4;
    const targetGlow = hovered || isSelected ? baseGlow + 0.18 : baseGlow;
    const u = fresnelMaterial.uniforms.uIntensity;
    u.value = THREE.MathUtils.damp(u.value, targetGlow, 4.5, delta);

    const targetScale = hovered ? 1.12 : isSelected ? 1.18 : 1.0;
    currentScaleRef.current = THREE.MathUtils.damp(
      currentScaleRef.current,
      targetScale,
      4.5,
      delta
    );

    const s = currentScaleRef.current;
    if (planetMeshRef.current) planetMeshRef.current.scale.set(s, s, s);
    if (dayBoostMeshRef.current) dayBoostMeshRef.current.scale.set(s, s, s);
    if (cloudsMeshRef.current) {
      const cs = s * 1.012;
      cloudsMeshRef.current.scale.set(cs, cs, cs);
    }
    if (atmosphereMeshRef.current) {
      const atmoScale = s * 1.03;
      atmosphereMeshRef.current.scale.set(atmoScale, atmoScale, atmoScale);
    }

    custom.moons.forEach((moon, idx) => {
      if (moonAngles.current[idx] == null) moonAngles.current[idx] = idx * 1.7;
      moonAngles.current[idx] += delta * moon.speed * 0.75;
      const el = moonRefs.current[idx];
      if (el) {
        const mx = Math.cos(moonAngles.current[idx]) * (radius * moon.distance * 0.85);
        const mz = Math.sin(moonAngles.current[idx]) * (radius * moon.distance * 0.85);
        el.position.set(mx, 0.08, mz);
      }
    });
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetMeshRef}
        material={nightFillMaterial}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(config.id);
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
        <sphereGeometry args={[radius, 80, 80]} />
      </mesh>
      <mesh ref={dayBoostMeshRef} material={dayBoostMaterial} raycast={() => null}>
        <sphereGeometry args={[radius * 1.001, 80, 80]} />
      </mesh>

      {wantsClouds && softClouds && (
        <mesh ref={cloudsMeshRef} raycast={() => null}>
          <sphereGeometry args={[radius * 1.012, 64, 64]} />
          <meshBasicMaterial
            map={softClouds}
            transparent
            opacity={0.1 + cloudCover * 0.16}
            depthWrite={false}
            color="#e4ecf4"
            toneMapped={false}
          />
        </mesh>
      )}

      <mesh ref={atmosphereMeshRef} material={fresnelMaterial} raycast={() => null}>
        <sphereGeometry args={[radius * 1.028, 48, 48]} />
      </mesh>

      {custom.hasRings && ringTexture && (
        <mesh rotation={[-Math.PI / 3.2, custom.ringTilt, 0]} raycast={() => null}>
          <ringGeometry args={[radius * 1.35, radius * 2.35, 96]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.75}
            roughness={0.7}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}

      {custom.moons.map((moon, idx) => (
        <group
          key={moon.id || idx}
          ref={(el) => {
            moonRefs.current[idx] = el;
          }}
        >
          <mesh raycast={() => null}>
            <sphereGeometry args={[moon.size, 24, 24]} />
            <meshBasicMaterial
              map={moonTextures[idx]?.colorMap}
              color="#c4c0b8"
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {(hovered || isSelected) && (
        <Html position={[0, radius + 1.1, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-150 font-sans">
            <div className="px-3.5 py-2 rounded-xl border border-white/5 bg-[rgba(10,10,20,0.55)] backdrop-blur-2xl shadow-zen-dock text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: badgePrimary }}
                />
                <span className="text-xs font-semibold text-zinc-100 tracking-tight whitespace-nowrap">
                  {config.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 pl-4 whitespace-nowrap">
                {config.domain} · {ARCHETYPE_LABEL[archetype] || archetype}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 pl-4 mt-1">
                Click to enter domain
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
