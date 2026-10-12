import * as THREE from "three";

/** Night ≈ day × 0.7 — soft fill keeps texture readable on the dark hemisphere. */
export const NIGHT_FLOOR = 0.7;

/**
 * Icosahedron subdivision — uniform tris, no longitude meridian strips.
 * Detail 6 ≈ 80k tris: smooth enough at Studio zoom without crushing SwiftShader.
 */
export const PLANET_ICO_DETAIL = 6;

/** Atmosphere / cloud shell. */
export const PLANET_SHELL_ICO_DETAIL = 4;

/** @deprecated Prefer PLANET_ICO_DETAIL. */
export const PLANET_SPHERE_WIDTH = 192;
/** @deprecated Prefer PLANET_ICO_DETAIL. */
export const PLANET_SPHERE_HEIGHT = 128;
/** @deprecated Prefer PLANET_SHELL_ICO_DETAIL. */
export const PLANET_SHELL_WIDTH = 96;
/** @deprecated Prefer PLANET_SHELL_ICO_DETAIL. */
export const PLANET_SHELL_HEIGHT = 64;
/** @deprecated */
export const PLANET_SPHERE_SEGMENTS = PLANET_SPHERE_WIDTH;

/** Default sun position in the cosmos (world origin). */
export const COSMOS_SUN_POS = new THREE.Vector3(0, 0, 0);

/** Studio key light — matches the preview directional. */
export const STUDIO_SUN_POS = new THREE.Vector3(4.5, 3.2, 5.5);

/**
 * Soft-lit planet shader (WebGL1/SwiftShader-safe — no dFdx/fwidth).
 * Analytic sphere UV + normal. Facing-led wrap avoids screen-vertical
 * sun N·L iso-bands; triangular dither breaks residual SDR steps.
 */
const SOFT_LIT_VERTEX = /* glsl */ `
  varying highp vec3 vLocalPos;
  varying highp vec3 vWorldPos;
  varying highp vec3 vM0;
  varying highp vec3 vM1;
  varying highp vec3 vM2;

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
  varying highp vec3 vLocalPos;
  varying highp vec3 vWorldPos;
  varying highp vec3 vM0;
  varying highp vec3 vM1;
  varying highp vec3 vM2;

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
    vec3 localDir = normalize(vLocalPos);
    vec2 uv = sphereUV(localDir);
    vec3 albedo = texture2D(map, uv).rgb;

    float seam = smoothstep(0.015, 0.0, min(uv.x, 1.0 - uv.x));
    if (seam > 0.0) {
      vec3 aL = texture2D(map, vec2(0.001, uv.y)).rgb;
      vec3 aR = texture2D(map, vec2(0.999, uv.y)).rgb;
      albedo = mix(albedo, 0.5 * (aL + aR), seam);
    }

    mat3 m = mat3(vM0, vM1, vM2);
    vec3 N = normalize(m * localDir);
    vec3 L = normalize(uSunPos - vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);

    float ndl = dot(N, L);
    // Facing fill = circular iso-contours. Any meaningful sun N·L weight redraws
    // the cheap vertical terminator columns under 8-bit SDR, so sun is a tint only.
    float face = pow(clamp(dot(N, V) * 0.5 + 0.5, 0.0, 1.0), 0.65);
    float sun = smoothstep(-0.35, 1.0, ndl);
    float brk = ignoise(localDir.xy * 40.0 + localDir.yz * 17.0) - 0.5;
    float day = clamp(face * 0.92 + sun * 0.08 + brk * 0.045, 0.0, 1.0);

    float wrap = mix(nightFloor, 1.0, day);

    // Wrap-space triangular dither (~±5 LSB).
    float t0 = ignoise(gl_FragCoord.xy);
    float t1 = ignoise(gl_FragCoord.xy + vec2(37.19, 17.57));
    wrap = clamp(wrap + (t0 + t1 - 1.0) * (5.0 / 255.0), 0.0, 1.15);

    gl_FragColor = vec4(albedo * wrap, 1.0);
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
  colorMap.anisotropy = Math.max(colorMap.anisotropy || 0, 8);
  colorMap.needsUpdate = true;
}

export interface SoftLitOptions {
  nightFloor?: number;
  /** World-space sun / key light position. */
  sunPos?: THREE.Vector3;
}

/**
 * Single-pass soft-lit planet material.
 * Night ≈ nightFloor × albedo; day ramps via facing-led soft wrap.
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
