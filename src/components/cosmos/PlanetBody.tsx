"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  SpecialistConfig,
  SpecialistId,
  PlanetCustomization,
  DEFAULT_PLANET_CUSTOMIZATIONS,
  normalizePlanetCustomization,
} from "@/types/orbit";
import { generateExoplanetTextures, generateExoplanetRingTexture } from "@/lib/exoplanetTextures";
import {
  createSoftLitMaterial,
  NIGHT_FLOOR,
  PLANET_SPHERE_WIDTH,
  PLANET_SPHERE_HEIGHT,
  PLANET_SHELL_WIDTH,
  PLANET_SHELL_HEIGHT,
} from "@/lib/softPlanetLighting";

interface PlanetBodyProps {
  config: SpecialistConfig;
  initialAngle: number;
  onSelect: (id: SpecialistId) => void;
  isSelected: boolean;
  onPositionUpdate?: (id: SpecialistId, pos: THREE.Vector3) => void;
  customization?: PlanetCustomization;
}

const FRESNEL_VERTEX = /* glsl */ `
  varying vec3 vSphereRadiusW;
  varying vec3 vWorldPos;
  void main() {
    vSphereRadiusW = mat3(modelMatrix) * position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRESNEL_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec3 vSphereRadiusW;
  varying vec3 vWorldPos;
  uniform vec3 uColor;
  uniform float uIntensity;
  void main() {
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 N = normalize(vSphereRadiusW);
    vec3 sunDir = normalize(-vWorldPos + vec3(0.0001));
    float NdotL = dot(N, sunDir);
    float lit = smoothstep(0.0, 0.55, NdotL);
    float fresnel = pow(1.0 - abs(dot(V, N)), 3.2);
    float a = fresnel * lit * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export function PlanetBody({
  config,
  initialAngle,
  onSelect,
  isSelected,
  onPositionUpdate,
  customization,
}: PlanetBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<Array<THREE.Group | null>>([]);

  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(initialAngle);
  const currentScaleRef = useRef(1.0);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  const custom = useMemo(() => {
    const fallback =
      DEFAULT_PLANET_CUSTOMIZATIONS[config.id] ||
      ({
        id: config.id,
        archetype: "gas_giant" as const,
        primaryColor: config.color,
        secondaryColor: config.glowColor,
        accentColor: "#c8b8a0",
        bumpScale: 0.06,
        roughness: 0.9,
        atmosphereIntensity: 0.4,
        cloudCover: 0.15,
        chromaMute: 0.4,
        hasRings: false,
        ringStyle: "none" as const,
        ringColor: config.color,
        ringTilt: 0.2,
        moons: [],
      } satisfies PlanetCustomization);
    return normalizePlanetCustomization(customization, fallback);
  }, [customization, config.id, config.color, config.glowColor]);

  // Fictional procedural surface: archetype + Studio palette + relief/roughness.
  const textures = useMemo(() => {
    return generateExoplanetTextures(custom);
  }, [custom]);

  const softLitMaterial = useMemo(
    () => createSoftLitMaterial(textures.colorMap, NIGHT_FLOOR),
    [textures.colorMap]
  );

  useEffect(() => {
    return () => {
      softLitMaterial.dispose();
    };
  }, [softLitMaterial]);

  // Procedural ring texture in the Studio ring color.
  const ringTexture = useMemo(() => {
    if (custom.hasRings && custom.ringStyle !== "none") {
      return generateExoplanetRingTexture(custom.ringStyle, custom.ringColor);
    }
    return null;
  }, [custom.hasRings, custom.ringStyle, custom.ringColor]);

  // Fictional procedural moons tinted from each moon's Studio color.
  const moonTextures = useMemo(
    () =>
      custom.moons.map((moon) =>
        generateExoplanetTextures({
          id: config.id,
          archetype: "rocky",
          primaryColor: new THREE.Color(moon.color).multiplyScalar(0.45).getStyle(),
          secondaryColor: moon.color,
          accentColor: "#d0c8bc",
          bumpScale: 0.05,
          roughness: 1.0,
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

  // Subtle sunlit-limb atmosphere (muted — surface must remain the hero).
  const atmoTint = useMemo(() => {
    // Zen: hush chroma — soft mist, never neon rim
    const c = new THREE.Color(custom.secondaryColor);
    c.lerp(new THREE.Color("#c8d2de"), 0.55);
    c.multiplyScalar(0.7);
    return c;
  }, [custom.secondaryColor]);

  const fresnelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: FRESNEL_VERTEX,
      fragmentShader: FRESNEL_FRAGMENT,
      uniforms: {
        uColor: { value: atmoTint.clone() },
        uIntensity: { value: 0.24 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      fog: false,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track moon angles
  const moonAngles = useRef<number[]>(custom.moons.map((_, i) => (i * Math.PI * 2) / Math.max(1, custom.moons.length)));

  useFrame(({ camera }, delta) => {
    // Orbital revolution around central Sun
    const speedMult = hovered ? 0.06 : 0.24;
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

    // Smooth axial rotation
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += delta * 0.28;
    }

    fresnelMaterial.uniforms.uColor.value.copy(atmoTint);
    const targetGlow = hovered || isSelected ? 0.36 : 0.24;
    const u = fresnelMaterial.uniforms.uIntensity;
    u.value = THREE.MathUtils.damp(u.value, targetGlow, 4.5, delta);

    // Silky smooth scale interpolation
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

    if (atmosphereMeshRef.current) {
      const atmoScale = s * 1.028;
      atmosphereMeshRef.current.scale.set(atmoScale, atmoScale, atmoScale);
    }

    // Dynamic satellite moon orbits
    custom.moons.forEach((moon, idx) => {
      if (!moonAngles.current[idx]) moonAngles.current[idx] = 0;
      moonAngles.current[idx] += delta * moon.speed * 0.8;

      const moonEl = moonRefs.current[idx];
      if (moonEl) {
        const mx = Math.cos(moonAngles.current[idx]) * (config.size * moon.distance * 0.85);
        const mz = Math.sin(moonAngles.current[idx]) * (config.size * moon.distance * 0.85);
        moonEl.position.set(mx, 0.1, mz);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Soft-lit analytical sphere — night ≈ 0.7× day, no terminator faceting */}
      <mesh
        ref={planetMeshRef}
        material={softLitMaterial}
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
        <sphereGeometry
          args={[config.size, PLANET_SPHERE_WIDTH, PLANET_SPHERE_HEIGHT]}
        />
      </mesh>

      {/* Soft sunlit-limb atmosphere — complements lighting, not a full outline */}
      <mesh ref={atmosphereMeshRef} material={fresnelMaterial} raycast={() => null}>
        <sphereGeometry
          args={[config.size * 1.032, PLANET_SHELL_WIDTH, PLANET_SHELL_HEIGHT]}
        />
      </mesh>

      {/* Procedural ring system in the Studio ring color */}
      {custom.hasRings && ringTexture && (
        <mesh rotation={[-Math.PI / 3.2, custom.ringTilt, 0]}>
          <ringGeometry args={[config.size * 1.35, config.size * 2.35, 96]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
            roughness={0.6}
            metalness={0.02}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Dynamic Customizable Satellite Moons */}
      {custom.moons.map((moon, idx) => (
        <group
          key={moon.id || idx}
          ref={(el) => {
            moonRefs.current[idx] = el;
          }}
        >
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect(config.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[moon.size, 24, 24]} />
            <meshBasicMaterial
              map={moonTextures[idx]?.colorMap}
              color="#c8c8d0"
            />
          </mesh>
        </group>
      ))}

      {/* Zen Minimalist Telemetry Badge on Hover */}
      {(hovered || isSelected) && (
        <Html position={[0, config.size + 1.1, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none transform -translate-y-2 transition-all duration-150 font-sans">
            <div className="px-3.5 py-2 rounded-xl border border-white/5 bg-[rgba(10,10,20,0.6)] backdrop-blur-2xl shadow-zen-dock text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: custom.primaryColor }}
                />
                <span className="text-xs font-semibold text-zinc-100 tracking-tight whitespace-nowrap">
                  {config.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 pl-4 whitespace-nowrap">
                {config.domain} · {custom.archetype.replace("_", " ")}
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
