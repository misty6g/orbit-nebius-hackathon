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
} from "@/types/orbit";
import {
  generateMoveHeroTextures,
  MOVE_HERO_PALETTE,
} from "@/lib/alienPlanetTextures";
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
  /** Override visual radius (defaults to config.size). */
  size?: number;
  /** Optional palette override for badge / atmosphere tint. */
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    atmosphere?: string;
  };
  /** Force archetype (otherwise Studio / defaults). */
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
    float lit = smoothstep(-0.05, 0.65, NdotL);
    float rim = pow(1.0 - abs(dot(V, N)), 2.6);
    float wrap = pow(max(0.0, 1.0 - abs(dot(V, N))), 1.4) * lit * 0.35;
    float a = (rim * lit * 0.85 + wrap) * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const ARCHETYPE_LABEL: Record<PlanetArchetype, string> = {
  rocky: "alien rocky",
  oceanic: "ocean world",
  gas_giant: "gas giant",
  ice_giant: "ice giant",
  volcanic: "volcanic",
};

/**
 * Reusable high-detail alien world with fictional procedural albedo.
 * Orbit / select / hover API matches PlanetBody so specialists can swap over.
 * Move uses the dedicated hero rust generator; others use Studio-driven exoplanet maps.
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

  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(initialAngle);
  const currentScaleRef = useRef(1.0);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  const custom = useMemo(() => {
    const base =
      customization ||
      DEFAULT_PLANET_CUSTOMIZATIONS[config.id] || {
        id: config.id,
        archetype: "rocky" as const,
        primaryColor: config.color,
        secondaryColor: config.glowColor,
        accentColor: "#ffedd5",
        bumpScale: 0.22,
        roughness: 0.9,
        hasRings: false,
        ringStyle: "none" as const,
        ringColor: config.color,
        ringTilt: 0.15,
        moons: [],
      };

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
    atmosphereColor ||
    palette?.atmosphere ||
    (config.id === "move" ? MOVE_HERO_PALETTE.atmosphere : custom.secondaryColor);
  const badgePrimary = palette?.primary || custom.primaryColor;
  const archetype = custom.archetype;

  const wantsClouds =
    hasCloudsProp ??
    (archetype === "oceanic" || archetype === "ice_giant" || config.id === "travel" || config.id === "move");

  const textures = useMemo(() => {
    if (config.id === "move") {
      return generateMoveHeroTextures();
    }
    const exo = generateExoplanetTextures(custom);
    return { ...exo, cloudsMap: null as THREE.CanvasTexture | null };
  }, [config.id, custom]);

  // Dual-layer soft lighting: MeshBasic night fill (cannot go black) + additive day boost
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

  // Soft procedural cloud veil for non-Move worlds that want clouds.
  const softClouds = useMemo(() => {
    if (config.id === "move") return textures.cloudsMap;
    if (!wantsClouds) return null;
    if (typeof window === "undefined") return null;

    const w = 1024;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const tint = new THREE.Color(custom.accentColor || "#e8f0f6");

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const v = y / h;
        const n =
          Math.sin(u * 18.7 + v * 9.3) * 0.5 +
          Math.sin(u * 41.2 - v * 22.1) * 0.25 +
          Math.sin((u + v) * 63.0) * 0.15;
        const cover = Math.max(0, Math.min(1, (n + 0.35) * 0.55));
        const i = (y * w + x) * 4;
        d[i] = Math.round(tint.r * 255);
        d[i + 1] = Math.round(tint.g * 255);
        d[i + 2] = Math.round(tint.b * 255);
        d[i + 3] = Math.round(cover * 140);
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
  }, [config.id, wantsClouds, textures.cloudsMap, custom.accentColor]);

  const ringTexture = useMemo(() => {
    if (custom.hasRings && custom.ringStyle !== "none") {
      return generateExoplanetRingTexture(custom.ringStyle, custom.ringColor);
    }
    return null;
  }, [custom.hasRings, custom.ringStyle, custom.ringColor]);

  const fresnelMaterial = useMemo(() => {
    // Soft teal/warm mist — Zen wraps atmosphere around the lit limb
    const tint = new THREE.Color(atmoColor).lerp(new THREE.Color("#5ec8c4"), 0.55);
    tint.lerp(new THREE.Color("#e8c4a0"), 0.15);
    return new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX,
      fragmentShader: FRESNEL_FRAGMENT,
      uniforms: {
        uColor: { value: tint },
        uIntensity: { value: 0.55 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      fog: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_state, delta) => {
    // Slow cinematic orbits so a large world lingers in the hero frame
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
      planetMeshRef.current.rotation.y += delta * (archetype === "gas_giant" || archetype === "ice_giant" ? 0.35 : 0.22);
      if (dayBoostMeshRef.current) {
        dayBoostMeshRef.current.rotation.copy(planetMeshRef.current.rotation);
      }
    }

    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.rotation.y += delta * 0.08;
    }

    fresnelMaterial.uniforms.uColor.value
      .set(atmoColor)
      .lerp(new THREE.Color("#5ec8c4"), 0.55)
      .lerp(new THREE.Color("#e8c4a0"), 0.15);
    const targetGlow = hovered || isSelected ? 0.72 : 0.55;
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
    if (planetMeshRef.current) {
      planetMeshRef.current.scale.set(s, s, s);
    }
    if (dayBoostMeshRef.current) {
      dayBoostMeshRef.current.scale.set(s, s, s);
    }
    if (cloudsMeshRef.current) {
      const cs = s * 1.012;
      cloudsMeshRef.current.scale.set(cs, cs, cs);
    }
    if (atmosphereMeshRef.current) {
      const atmoScale = s * 1.03;
      atmosphereMeshRef.current.scale.set(atmoScale, atmoScale, atmoScale);
    }
  });

  const cloudMap = softClouds;

  return (
    <group ref={groupRef}>
      {/* Night fill: MeshBasic at 0.7× albedo — texture always readable */}
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
      {/* Day boost: additive (1-0.7)×albedo×ndl so day reaches full albedo */}
      <mesh
        ref={dayBoostMeshRef}
        material={dayBoostMaterial}
        raycast={() => null}
      >
        <sphereGeometry args={[radius * 1.001, 80, 80]} />
      </mesh>

      {wantsClouds && cloudMap && (
        <mesh ref={cloudsMeshRef} raycast={() => null}>
          <sphereGeometry args={[radius * 1.012, 64, 64]} />
          <meshBasicMaterial
            map={cloudMap}
            transparent
            opacity={archetype === "oceanic" ? 0.18 : 0.14}
            depthWrite={false}
            color="#e8f0f8"
            toneMapped={false}
          />
        </mesh>
      )}

      <mesh ref={atmosphereMeshRef} material={fresnelMaterial} raycast={() => null}>
        <sphereGeometry args={[radius * 1.025, 48, 48]} />
      </mesh>

      {custom.hasRings && ringTexture && (
        <mesh rotation={[-Math.PI / 3.2, custom.ringTilt, 0]} raycast={() => null}>
          <ringGeometry args={[radius * 1.35, radius * 2.35, 96]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            roughness={0.65}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      )}

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
