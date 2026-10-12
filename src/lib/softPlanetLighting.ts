import * as THREE from "three";

/** Night ≈ day × 0.7 — soft fill keeps texture readable on the dark hemisphere. */
export const NIGHT_FLOOR = 0.7;

/**
 * High-segment UV sphere for planet bodies.
 * Screen period of longitude facets ≈ π·diameter_px / WIDTH — keep WIDTH high
 * enough that facets stay sub-pixel at Studio zoom (≈400px planet ⇒ WIDTH≥320).
 * Analytical sphereUV / normals ignore mesh UVs, so the UV seam does not imprint.
 */
export const PLANET_SPHERE_WIDTH = 384;
export const PLANET_SPHERE_HEIGHT = 256;

/** Atmosphere / cloud shell — slightly fewer segments is fine. */
export const PLANET_SHELL_WIDTH = 192;
export const PLANET_SHELL_HEIGHT = 128;

/** @deprecated Prefer PLANET_SPHERE_WIDTH / HEIGHT. */
export const PLANET_ICO_DETAIL = 7;
/** @deprecated Prefer PLANET_SHELL_WIDTH / HEIGHT. */
export const PLANET_SHELL_ICO_DETAIL = 5;

/** Default sun position in the cosmos (world origin). */
export const COSMOS_SUN_POS = new THREE.Vector3(0, 0, 0);

/** Studio key light — matches the preview directional. */
export const STUDIO_SUN_POS = new THREE.Vector3(4.5, 3.2, 5.5);

/**
 * Soft-lit planet shader.
 * - Object-space sphere direction re-normalized per fragment (no chord sag)
 * - Equirect UV from that direction (no mesh-UV meridian imprint)
 * - World normal via varying (modelMatrix is vertex-only in ShaderMaterial)
 * - Half-Lambert wrap + fwidth AA + triangular SDR dither
 */
const SOFT_LIT_VERTEX = /* glsl */ `
  varying vec3 vLocalPos;
  varying vec3 vWorldPos;
  // modelMatrix columns — ShaderMaterial only injects modelMatrix in the vertex stage.
  varying vec3 vM0;
  varying vec3 vM1;
  varying vec3 vM2;

  void main() {
    vLocalPos = position;
    mat3 m = mat3(modelMatrix);
    vM0 = m[0];
    vM1 = m[1];
    vM2 = m[2];
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
  varying vec3 vM0;
  varying vec3 vM1;
  varying vec3 vM2;

  const float PI = 3.141592653589793;

  vec2 sphereUV(vec3 dir) {
    float polar = acos(clamp(dir.y, -1.0, 1.0));
    float azimuth = atan(dir.x, dir.z);
    return vec2(azimuth / (2.0 * PI) + 0.5, polar / PI);
  }

  float ignoise(vec2 p) {
    return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
  }

  void main() {
    // Re-normalize every fragment — kills longitude stair-steps from chord lerps.
    vec3 localDir = normalize(vLocalPos);
    vec2 uv = sphereUV(localDir);
    vec3 albedo = texture2D(map, uv).rgb;

    float seam = smoothstep(0.015, 0.0, min(uv.x, 1.0 - uv.x));
    if (seam > 0.0) {
      vec3 aL = texture2D(map, vec2(0.001, uv.y)).rgb;
      vec3 aR = texture2D(map, vec2(0.999, uv.y)).rgb;
      albedo = mix(albedo, 0.5 * (aL + aR), seam);
    }

    // Analytic world normal from object-space sphere dir (not lerped vertex N).
    mat3 m = mat3(vM0, vM1, vM2);
    vec3 N = normalize(m * localDir);
    vec3 L = normalize(uSunPos - vWorldPos);
    float ndl = dot(N, L);

    // Half-Lambert spreads the terminator; fwidth softens triangle-edge Mach bands.
    float hl = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);
    float day = hl * hl;
    float aa = max(fwidth(day) * 1.35, 0.01);
    day = smoothstep(0.03 - aa, 0.97 + aa, day);

    float brk = ignoise(localDir.xy * 64.0 + localDir.yz * 28.0) - 0.5;
    day = clamp(day + brk * 0.02, 0.0, 1.0);

    float wrap = mix(nightFloor, 1.0, day);
    vec3 color = albedo * wrap;

    // Triangular dither ≈ ±3 LSB — breaks residual SDR posterization.
    float t0 = ignoise(gl_FragCoord.xy);
    float t1 = ignoise(gl_FragCoord.xy + vec2(37.19, 17.57));
    color += vec3((t0 + t1 - 1.0) * (3.0 / 255.0));

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
