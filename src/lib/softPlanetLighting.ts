import * as THREE from "three";

/** Night ≈ day × 0.75 (≈25–30% darker; readable texture on dark hemisphere). */
export const NIGHT_FLOOR = 0.75;

const DAY_BOOST_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormalW = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const DAY_BOOST_FRAGMENT = /* glsl */ `
  uniform sampler2D map;
  uniform float nightFloor;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;

  void main() {
    vec3 albedo = texture2D(map, vUv).rgb;
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(-vWorldPos);
    float ndl = clamp(dot(N, L), 0.0, 1.0);
    float day = smoothstep(0.0, 0.85, ndl);
    // Additive boost only — base MeshBasic already shows nightFloor × albedo
    float boost = (1.0 - nightFloor) * day;
    gl_FragColor = vec4(albedo * boost, 1.0);
  }
`;

function prepMap(colorMap: THREE.Texture): void {
  if ("colorSpace" in colorMap) {
    colorMap.colorSpace = THREE.SRGBColorSpace;
  }
  colorMap.needsUpdate = true;
}

/**
 * Base layer: MeshBasicMaterial at nightFloor gray multiply.
 * Guarantees readable albedo on the entire sphere (cannot go pitch-black).
 */
export function createNightFillMaterial(
  colorMap: THREE.Texture,
  nightFloor: number = NIGHT_FLOOR
): THREE.MeshBasicMaterial {
  prepMap(colorMap);
  const g = nightFloor; // multiply color
  const mat = new THREE.MeshBasicMaterial({
    map: colorMap,
    color: new THREE.Color(g, g, g),
    fog: false,
    toneMapped: false,
  });
  return mat;
}

/**
 * Additive day boost layer: adds the remaining (1-nightFloor)×albedo×ndl.
 * Combined with night fill → night = 0.7×albedo, day = 1.0×albedo.
 */
export function createDayBoostMaterial(
  colorMap: THREE.Texture,
  nightFloor: number = NIGHT_FLOOR
): THREE.ShaderMaterial {
  prepMap(colorMap);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: colorMap },
      nightFloor: { value: nightFloor },
    },
    vertexShader: DAY_BOOST_VERTEX,
    fragmentShader: DAY_BOOST_FRAGMENT,
    fog: false,
    lights: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  return mat;
}

/** @deprecated use createNightFillMaterial + createDayBoostMaterial */
export function createSoftLitMaterial(
  colorMap: THREE.Texture,
  nightFloor: number = NIGHT_FLOOR
): THREE.ShaderMaterial {
  // Single-shader fallback kept for callers; prefer dual-layer.
  prepMap(colorMap);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: colorMap },
      nightFloor: { value: nightFloor },
    },
    vertexShader: DAY_BOOST_VERTEX,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float nightFloor;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vWorldPos;
      void main() {
        vec3 albedo = texture2D(map, vUv).rgb;
        vec3 N = normalize(vNormalW);
        vec3 L = normalize(-vWorldPos);
        float ndl = clamp(dot(N, L), 0.0, 1.0);
        float wrap = mix(nightFloor, 1.0, smoothstep(0.0, 0.85, ndl));
        gl_FragColor = vec4(albedo * wrap, 1.0);
      }
    `,
    fog: false,
    lights: false,
    toneMapped: false,
  });
  return mat;
}
