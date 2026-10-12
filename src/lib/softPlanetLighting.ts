import * as THREE from "three";

/** Night ≈ day × 0.7 — soft fill keeps texture readable on the dark hemisphere. */
export const NIGHT_FLOOR = 0.7;

/**
 * High-segment UV sphere for planet bodies.
 * Analytical sphereUV / normals in the shader ignore mesh UVs, so longitude
 * meridians do not imprint — segments only buy a smooth silhouette + short chords.
 */
export const PLANET_SPHERE_WIDTH = 160;
export const PLANET_SPHERE_HEIGHT = 112;

/** Atmosphere / cloud shell — slightly fewer segments is fine. */
export const PLANET_SHELL_WIDTH = 96;
export const PLANET_SHELL_HEIGHT = 64;

/** @deprecated Prefer PLANET_SPHERE_WIDTH / HEIGHT. */
export const PLANET_ICO_DETAIL = 6;
/** @deprecated Prefer PLANET_SHELL_WIDTH / HEIGHT. */
export const PLANET_SHELL_ICO_DETAIL = 5;

/** Default sun position in the cosmos (world origin). */
export const COSMOS_SUN_POS = new THREE.Vector3(0, 0, 0);

/** Studio key light — matches the preview directional. */
export const STUDIO_SUN_POS = new THREE.Vector3(4.5, 3.2, 5.5);

/**
 * Soft-lit planet shader.
 * - Analytical sphere normal (no mesh-normal faceting)
 * - Equirect UV derived from local direction (works with any sphere mesh;
 *   avoids relying on SphereGeometry's UV seam)
 * - Half-Lambert wrap + triangular screen dither to kill 8-bit terminator bands
 */
const SOFT_LIT_VERTEX = /* glsl */ `
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  varying vec3 vSphereRadiusW;

  void main() {
    vLocalPos = position;
    // Direction from sphere center in world space (uniform scale assumed).
    vSphereRadiusW = mat3(modelMatrix) * position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SOFT_LIT_FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D map;
  uniform float nightFloor;
  uniform vec3 uSunPos;
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  varying vec3 vSphereRadiusW;

  const float PI = 3.141592653589793;

  // Match three.js SphereGeometry equirect UVs.
  vec2 sphereUV(vec3 lp) {
    vec3 n = normalize(lp);
    float polar = acos(clamp(n.y, -1.0, 1.0));
    float azimuth = atan(n.x, n.z);
    float u = azimuth / (2.0 * PI) + 0.5;
    float v = polar / PI;
    return vec2(u, v);
  }

  // Stable interleaved-gradient noise — breaks 8-bit terminator posterization.
  float ignoise(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  void main() {
    vec2 uv = sphereUV(vLocalPos);
    vec3 albedo = texture2D(map, uv).rgb;
    // Soften the equirect wrap seam
    float seam = smoothstep(0.02, 0.0, min(uv.x, 1.0 - uv.x));
    if (seam > 0.0) {
      vec3 aL = texture2D(map, vec2(0.001, uv.y)).rgb;
      vec3 aR = texture2D(map, vec2(0.999, uv.y)).rgb;
      albedo = mix(albedo, 0.5 * (aL + aR), seam);
    }

    vec3 N = normalize(vSphereRadiusW);
    vec3 L = normalize(uSunPos - vWorldPos);
    float ndl = dot(N, L);

    // Half-Lambert: spreads the terminator so iso-contours are less steep.
    float hl = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
    float day = smoothstep(0.05, 0.98, hl * hl);

    // Tiny surface-space break so lighting steps aren't laser-straight verticals.
    float brk = ignoise(vLocalPos.xy * 47.0 + vLocalPos.yz * 23.0) - 0.5;
    day = clamp(day + brk * 0.018, 0.0, 1.0);

    float wrap = mix(nightFloor, 1.0, day);
    vec3 color = albedo * wrap;

    // Triangular dither ≈ ±2.5 LSB — kills SDR posterization on soft gradients.
    float t0 = ignoise(gl_FragCoord.xy);
    float t1 = ignoise(gl_FragCoord.xy + vec2(37.19, 17.57));
    float dith = (t0 + t1 - 1.0) * (2.5 / 255.0);
    color += vec3(dith);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function prepMap(colorMap: THREE.Texture): void {
  if ("colorSpace" in colorMap) {
    colorMap.colorSpace = THREE.SRGBColorSpace;
  }
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.generateMipmaps = true;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.magFilter = THREE.LinearFilter;
  colorMap.anisotropy = Math.max(colorMap.anisotropy || 0, 16);
  colorMap.needsUpdate = true;
}

export interface SoftLitOptions {
  nightFloor?: number;
  /** World-space sun / key light position. */
  sunPos?: THREE.Vector3;
}

/**
 * Single-pass soft-lit planet material.
 * Night ≈ nightFloor × albedo; day ramps via analytical sphere N·L.
 */
export function createSoftLitMaterial(
  colorMap: THREE.Texture,
  nightFloorOrOpts: number | SoftLitOptions = NIGHT_FLOOR
): THREE.ShaderMaterial {
  prepMap(colorMap);
  const opts: SoftLitOptions =
    typeof nightFloorOrOpts === "number"
      ? { nightFloor: nightFloorOrOpts }
      : nightFloorOrOpts;
  const nightFloor = opts.nightFloor ?? NIGHT_FLOOR;
  const sunPos = opts.sunPos?.clone() ?? COSMOS_SUN_POS.clone();

  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: colorMap },
      nightFloor: { value: nightFloor },
      uSunPos: { value: sunPos },
    },
    vertexShader: SOFT_LIT_VERTEX,
    fragmentShader: SOFT_LIT_FRAGMENT,
    fog: false,
    lights: false,
    toneMapped: false,
  });
}

/** @deprecated Prefer createSoftLitMaterial */
export function createNightFillMaterial(
  colorMap: THREE.Texture,
  nightFloor: number = NIGHT_FLOOR
): THREE.ShaderMaterial {
  return createSoftLitMaterial(colorMap, nightFloor);
}

/** @deprecated Dual-layer day boost removed. */
export function createDayBoostMaterial(
  _colorMap: THREE.Texture,
  _nightFloor: number = NIGHT_FLOOR
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: /* glsl */ `void main() { gl_Position = vec4(0.0); }`,
    fragmentShader: /* glsl */ `void main() { discard; }`,
    transparent: true,
    depthWrite: false,
    visible: false,
  });
}

/** Back-compat alias. */
export const PLANET_SPHERE_SEGMENTS = PLANET_SPHERE_WIDTH;
