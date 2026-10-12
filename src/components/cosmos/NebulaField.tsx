"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MILKY_WAY_TEXTURE } from "@/lib/planetAssets";
import {
  DEFAULT_NEBULA_CUSTOMIZATION,
  NebulaCustomization,
} from "@/types/orbit";

const NEBULA_VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

// Direction-space fbm — no atan UVs, so no polar pinch / radial wedges.
const NEBULA_FRAGMENT = /* glsl */ `
  varying vec3 vDir;
  uniform float uTime;
  uniform vec3 uRight;
  uniform vec3 uLeft;
  uniform vec3 uDeep;

  float hash3(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float vnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    // Quintic smoothstep — softer than cubic, hides lattice edges
    vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float n000 = hash3(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, u.x);
    float nx10 = mix(n010, n110, u.x);
    float nx01 = mix(n001, n101, u.x);
    float nx11 = mix(n011, n111, u.x);
    float nxy0 = mix(nx00, nx10, u.y);
    float nxy1 = mix(nx01, nx11, u.y);
    return mix(nxy0, nxy1, u.z);
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    mat3 rot = mat3(
      0.00,  0.80,  0.60,
     -0.80,  0.36, -0.48,
     -0.60, -0.48,  0.64
    );
    for (int i = 0; i < 5; i++) {
      v += a * vnoise3(p);
      p = rot * p * 2.02 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vDir);
    float t = uTime * 0.015;

    // Sample noise in direction space (seam-free on the sphere)
    vec3 pL = dir * 2.4 + vec3(t * 0.35, -t * 0.22, t * 0.18);
    vec3 pR = dir * 2.7 + vec3(-t * 0.28, t * 0.31, -t * 0.15);
    vec3 pW = dir * 5.5 + vec3(t * 0.4, t * 0.12, -t * 0.33);
    vec3 pD = dir * 1.35 + vec3(t * 0.08, -t * 0.05, t * 0.06);

    float leftN = fbm3(pL);
    float rightN = fbm3(pR);
    float wisps = fbm3(pW);
    float deepN = fbm3(pD);

    // Soft left/right blend — wide transition, no hard meridian cut
    float side = dir.x + (wisps - 0.5) * 0.35;
    float rightSide = smoothstep(-0.55, 0.55, side);
    float leftSide = 1.0 - rightSide;

    // Soft density masks (avoid hard isosurfaces that read as wedges)
    float leftMask = smoothstep(0.22, 0.72, leftN) * leftSide * (0.7 + 0.3 * wisps);
    float rightMask = smoothstep(0.25, 0.75, rightN) * rightSide * (0.7 + 0.3 * wisps);
    float deepWash = smoothstep(0.15, 0.65, deepN) * 0.45;

    // Mild limb fade near poles so any residual pinching stays dim
    float poleFade = 1.0 - smoothstep(0.82, 0.98, abs(dir.y));
    leftMask *= poleFade;
    rightMask *= poleFade;

    vec3 col =
      uRight * rightMask * 1.35 +
      uLeft * leftMask * 1.55 +
      uDeep * deepWash;

    float alpha = clamp(rightMask * 0.95 + leftMask * 1.1 + deepWash * 0.35, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

interface NebulaFieldProps {
  colors?: NebulaCustomization;
}

/**
 * Cinematic backdrop: Milky Way shell + user-tintable nebula split.
 * Nebula noise is sampled in direction space (no atan UV poles).
 */
export function NebulaField({
  colors = DEFAULT_NEBULA_CUSTOMIZATION,
}: NebulaFieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const skyMap = useTexture(MILKY_WAY_TEXTURE);
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const nebulaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERTEX,
      fragmentShader: NEBULA_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uRight: { value: new THREE.Color(colors.rightColor) },
        uLeft: { value: new THREE.Color(colors.leftColor) },
        uDeep: { value: new THREE.Color(colors.deepColor) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
      fog: false,
    });
  }, []);

  useEffect(() => {
    nebulaMaterial.uniforms.uLeft.value.set(colors.leftColor);
    nebulaMaterial.uniforms.uRight.value.set(colors.rightColor);
    nebulaMaterial.uniforms.uDeep.value.set(colors.deepColor);
  }, [colors.leftColor, colors.rightColor, colors.deepColor, nebulaMaterial]);

  useFrame((state, delta) => {
    if (!reducedMotion) {
      nebulaMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dim milky-way shell — higher tessellation + low opacity to hide pole pinch */}
      <mesh>
        <sphereGeometry args={[620, 96, 64]} />
        <meshBasicMaterial
          map={skyMap}
          side={THREE.BackSide}
          color="#3a3a48"
          transparent
          opacity={0.22}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh material={nebulaMaterial}>
        <sphereGeometry args={[600, 96, 64]} />
      </mesh>
    </group>
  );
}
