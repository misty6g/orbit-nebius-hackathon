import * as THREE from "three";

interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface AlienPlanetTextures {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture | null;
}

/** Fixed fictional palette for the Orbit Move hero world — rust / ochre / charcoal. */
export const MOVE_HERO_PALETTE = {
  charcoal: { r: 72, g: 50, b: 42 } as RGB,
  deepRust: { r: 138, g: 68, b: 42 } as RGB,
  rust: { r: 186, g: 98, b: 52 } as RGB,
  ochre: { r: 218, g: 152, b: 86 } as RGB,
  paleDust: { r: 236, g: 198, b: 152 } as RGB,
  maria: { r: 78, g: 58, b: 50 } as RGB,
  rim: { r: 244, g: 210, b: 162 } as RGB,
  atmosphere: "#e8a060",
};

function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  const clampT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * clampT),
    g: Math.round(c1.g + (c2.g - c1.g) * clampT),
    b: Math.round(c1.b + (c2.b - c1.b) * clampT),
  };
}

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = noise2D(i, j);
  const n10 = noise2D(i + 1, j);
  const n01 = noise2D(i, j + 1);
  const n11 = noise2D(i + 1, j + 1);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;
  return nx0 * (1 - sy) + nx1 * sy;
}

function fbm(x: number, y: number, octaves = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let o = 0; o < octaves; o++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2.1;
    amp *= 0.48;
  }
  return val;
}

function warp2(u: number, v: number, s: number, ox: number, oy: number): { x: number; y: number } {
  const qx = fbm(u * s + ox, v * s + oy, 3);
  const qy = fbm(u * s + ox + 3.7, v * s + oy + 8.1, 3);
  return { x: u + (qx - 0.5) * 0.12, y: v + (qy - 0.5) * 0.12 };
}

/** Hand-placed impact basins so overview distance still reads as cratered terrain. */
const MACRO_CRATERS: Array<{ u: number; v: number; r: number; depth: number }> = [
  { u: 0.22, v: 0.38, r: 0.09, depth: 0.85 },
  { u: 0.48, v: 0.52, r: 0.13, depth: 1.0 },
  { u: 0.71, v: 0.34, r: 0.07, depth: 0.7 },
  { u: 0.35, v: 0.68, r: 0.08, depth: 0.75 },
  { u: 0.82, v: 0.62, r: 0.1, depth: 0.9 },
  { u: 0.12, v: 0.58, r: 0.055, depth: 0.65 },
  { u: 0.58, v: 0.28, r: 0.06, depth: 0.6 },
  { u: 0.9, v: 0.42, r: 0.05, depth: 0.55 },
];

function craterField(
  u: number,
  v: number
): { rim: number; bowl: number; floor: number } {
  let rim = 0;
  let bowl = 0;
  let floor = 0;

  for (const c of MACRO_CRATERS) {
    let du = Math.abs(u - c.u);
    if (du > 0.5) du = 1 - du;
    const dv = (v - c.v) * 1.15; // slight polar squash on equirect
    const d = Math.sqrt(du * du + dv * dv) / c.r;
    if (d >= 1.15) continue;

    const localRim = smoothstep(1.12, 0.78, d) - smoothstep(0.78, 0.55, d);
    const localBowl = smoothstep(0.85, 0.15, d);
    const localFloor = smoothstep(0.45, 0.05, d);

    rim = Math.max(rim, localRim * c.depth);
    bowl = Math.max(bowl, localBowl * c.depth);
    floor = Math.max(floor, localFloor * c.depth);
  }

  // Dense mid-scale crater peppering (procedural, not photo-derived).
  const micro = Math.abs(Math.sin(smoothNoise(u * 28, v * 28) * Math.PI * 4));
  const microRim = smoothstep(0.7, 0.88, micro) - smoothstep(0.88, 0.98, micro);
  const microBowl = smoothstep(0.7, 0.2, micro);
  rim = Math.max(rim, microRim * 0.45);
  bowl = Math.max(bowl, microBowl * 0.35);

  return { rim, bowl, floor };
}

let cache: AlienPlanetTextures | null = null;
let cacheVersion: string | null = null;
const GEN_VERSION = "move-hero-v4-zen";

/**
 * Hero rust rocky world for Orbit Move only.
 * Large continents, impact maria, rimmed craters and regolith grain —
 * fully fictional procedural albedo (not Earth/Mars photo maps).
 */
export function generateMoveHeroTextures(): AlienPlanetTextures {
  if (cache && cacheVersion === GEN_VERSION) return cache;

  if (typeof window === "undefined") {
    const dummy = new THREE.CanvasTexture(document.createElement("canvas"));
    return { colorMap: dummy, bumpMap: dummy, roughnessMap: dummy, cloudsMap: null };
  }

  const width = 2048;
  const height = 1024;
  const P = MOVE_HERO_PALETTE;

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = width;
  colorCanvas.height = height;
  const colorCtx = colorCanvas.getContext("2d")!;
  const colorImg = colorCtx.createImageData(width, height);
  const cData = colorImg.data;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext("2d")!;
  const bumpImg = bumpCtx.createImageData(width, height);
  const bData = bumpImg.data;

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext("2d")!;
  const roughImg = roughCtx.createImageData(width, height);
  const rData = roughImg.data;

  const cloudCanvas = document.createElement("canvas");
  cloudCanvas.width = width;
  cloudCanvas.height = height;
  const cloudCtx = cloudCanvas.getContext("2d")!;
  const cloudImg = cloudCtx.createImageData(width, height);
  const clData = cloudImg.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const idx = (y * width + x) * 4;

      const w = warp2(u, v, 3.2, 1.7, 6.4);
      // Continent-scale landmass: large, readable provinces at overview zoom.
      const continent = fbm(w.x * 2.4 + 0.3, w.y * 2.4 + 1.1, 5);
      const highland = fbm(w.x * 5.5 + 4.2, w.y * 5.5 + 2.8, 5);
      const ridge = fbm(w.x * 14 + 9.1, w.y * 14 + 3.3, 4);
      const grain = smoothNoise(u * 160 + 2.2, v * 160 + 7.7);
      const mottle = fbm(u * 36 + 11.3, v * 36 + 5.9, 4);
      const { rim, bowl, floor } = craterField(u, v);

      // Maria sit in low continental basins — dark charcoal plains.
      const basin = smoothstep(0.58, 0.38, continent) * smoothstep(0.55, 0.3, highland);
      const maria = basin * (0.55 + 0.45 * fbm(u * 3.5 + 14.2, v * 3.5 + 8.6, 3));

      // Elevation story for bump + albedo.
      const elevation = Math.max(
        0,
        Math.min(
          1,
          continent * 0.42 +
            highland * 0.28 +
            ridge * 0.14 +
            rim * 0.22 -
            bowl * 0.28 -
            maria * 0.18
        )
      );

      let colorRgb: RGB;
      if (maria > 0.35) {
        colorRgb = lerpColor(P.deepRust, P.maria, smoothstep(0.35, 0.9, maria));
      } else if (elevation > 0.62) {
        colorRgb = lerpColor(P.rust, P.ochre, (elevation - 0.62) / 0.38);
        colorRgb = lerpColor(colorRgb, P.paleDust, Math.max(0, ridge - 0.55) * 0.55);
      } else if (elevation > 0.38) {
        colorRgb = lerpColor(P.deepRust, P.rust, (elevation - 0.38) / 0.24);
      } else {
        colorRgb = lerpColor(P.charcoal, P.deepRust, elevation / 0.38);
      }

      // Bright crater rims + shadowed bowls.
      colorRgb = lerpColor(colorRgb, P.rim, rim * 0.42);
      colorRgb = {
        r: clamp255(colorRgb.r * (1 - bowl * 0.28)),
        g: clamp255(colorRgb.g * (1 - bowl * 0.28)),
        b: clamp255(colorRgb.b * (1 - bowl * 0.26)),
      };
      // Flat dark crater floors (maria-like).
      colorRgb = lerpColor(colorRgb, P.maria, floor * 0.55);

      // Soft tonal mottling — Zen overview prefers calm spheres over harsh grain.
      const tonal = 1 + (mottle - 0.5) * 0.18 + (grain - 0.5) * 0.08;
      const eqWarm = 1 + (1 - Math.abs(lat)) * 0.06;
      colorRgb = {
        r: clamp255(colorRgb.r * tonal * eqWarm),
        g: clamp255(colorRgb.g * tonal),
        b: clamp255(colorRgb.b * tonal * (1 - Math.abs(lat) * 0.04)),
      };

      // Polar dust-frost wash (thin, warm — not Earth ice).
      const polar = smoothstep(0.72, 0.92, Math.abs(lat) + (mottle - 0.5) * 0.08);
      if (polar > 0) {
        colorRgb = lerpColor(colorRgb, P.paleDust, polar * 0.35);
      }

      cData[idx] = colorRgb.r;
      cData[idx + 1] = colorRgb.g;
      cData[idx + 2] = colorRgb.b;
      cData[idx + 3] = 255;

      const bumpVal = clamp255(elevation * 220 + rim * 50 - bowl * 40 - maria * 25 + (grain - 0.5) * 18);
      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;

      // Matte highlands, slightly smoother dust ponds / maria.
      const roughVal = clamp255(245 - maria * 40 - floor * 55 + ridge * 20 - (grain - 0.5) * 25);
      rData[idx] = roughVal;
      rData[idx + 1] = roughVal;
      rData[idx + 2] = roughVal;
      rData[idx + 3] = 255;

      // Thin ochre dust-cloud veil — sparse streaks, not Earth weather.
      const dustBand = fbm(u * 6.5 + 2.4, v * 3.2 + 9.1, 4);
      const dustStreak = fbm(u * 18 + 7.7, v * 5.5 + 1.3, 3);
      const dustCover =
        smoothstep(0.58, 0.82, dustBand) *
        smoothstep(0.4, 0.75, dustStreak) *
        (1 - polar * 0.6) *
        0.55;
      const da = clamp255(dustCover * 255);
      clData[idx] = 235;
      clData[idx + 1] = 190;
      clData[idx + 2] = 140;
      clData[idx + 3] = da;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);
  cloudCtx.putImageData(cloudImg, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.generateMipmaps = true;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.anisotropy = 4;
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.generateMipmaps = true;
  bumpMap.minFilter = THREE.LinearMipmapLinearFilter;
  bumpMap.anisotropy = 2;
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.generateMipmaps = true;
  roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
  roughnessMap.needsUpdate = true;

  const cloudsMap = new THREE.CanvasTexture(cloudCanvas);
  cloudsMap.colorSpace = THREE.SRGBColorSpace;
  cloudsMap.wrapS = THREE.RepeatWrapping;
  cloudsMap.wrapT = THREE.ClampToEdgeWrapping;
  cloudsMap.generateMipmaps = true;
  cloudsMap.minFilter = THREE.LinearMipmapLinearFilter;
  cloudsMap.needsUpdate = true;

  cacheVersion = GEN_VERSION;
  cache = { colorMap, bumpMap, roughnessMap, cloudsMap };
  return cache;
}
