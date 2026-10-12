import * as THREE from "three";
import { PlanetArchetype, RingStyle, PlanetCustomization } from "@/types/orbit";

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 128, g: 128, b: 128 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  const clampT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * clampT),
    g: Math.round(c1.g + (c2.g - c1.g) * clampT),
    b: Math.round(c1.b + (c2.b - c1.b) * clampT),
  };
}

/** Soft desaturate — keep enough chroma that lit faces stay readable at overview. */
function mute(c: RGB, amt: number): RGB {
  const softAmt = Math.max(0, Math.min(1, amt * 0.55));
  const lum = Math.round(0.299 * c.r + 0.587 * c.g + 0.114 * c.b);
  return lerpColor(c, { r: lum, g: lum, b: lum }, softAmt);
}

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Multi-octave harmonic noise function for procedural terrain & atmospheric bands
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

/** Domain-warped lookup: perturbs (u, v) by low-frequency fbm so bands, coasts and craters flow organically. */
function warp2(u: number, v: number, s: number, ox: number, oy: number): { x: number; y: number } {
  const qx = fbm(u * s + ox, v * s + oy, 3);
  const qy = fbm(u * s + ox + 3.7, v * s + oy + 8.1, 3);
  return { x: u + (qx - 0.5) * 0.09, y: v + (qy - 0.5) * 0.09 };
}

/**
 * Final tonal pass shared by every archetype: mid-scale mottling plus fine
 * grain so surfaces read as weathered regolith / turbulent cloud instead of
 * flat fills, with a lifted floor so night sides never crush to pure black.
 */
function finishColor(c: RGB, mottle: number, grain: number, drift: number, lat: number): RGB {
  // Zen overview: soft tonal provinces, muted grain — detail resolves up close via mipmaps.
  const eq = 1 - Math.abs(lat);
  const m = 1.08 + (mottle - 0.5) * 0.18 + (grain - 0.5) * 0.08 + (drift - 0.5) * 0.14;
  const lift = 36;
  return {
    r: Math.max(42, Math.min(255, Math.round(c.r * m * (1 + (eq - 0.5) * 0.06)) + lift)),
    g: Math.max(40, Math.min(255, Math.round(c.g * m) + lift)),
    b: Math.max(40, Math.min(255, Math.round(c.b * m * (1 + (0.5 - eq) * 0.06)) + lift)),
  };
}

export interface ExoplanetMaterialTextures {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

const textureCache = new Map<string, ExoplanetMaterialTextures>();
const ringTextureCache = new Map<string, THREE.CanvasTexture>();
// Bump whenever the generator algorithm changes so stale in-memory or
// persisted canvases from an older build can never be reused.
const TEXTURE_GEN_VERSION = "v7-zen";

/**
 * Procedural fictional exoplanet textures with per-archetype realistic surface
 * stories (desaturated palettes, craters/storms/caps/fissures/cracks) driven
 * entirely by the Studio customization. Roughness maps carry real variation
 * (scalar roughness multiplies them) so nothing renders as flat plastic.
 */
export function generateExoplanetTextures(
  customization: PlanetCustomization
): ExoplanetMaterialTextures {
  const cacheKey = `${TEXTURE_GEN_VERSION}_${customization.id}_${customization.archetype}_${customization.primaryColor}_${customization.secondaryColor}_${customization.accentColor}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  if (typeof window === "undefined") {
    const dummy = new THREE.CanvasTexture(document.createElement("canvas"));
    return { colorMap: dummy, bumpMap: dummy, roughnessMap: dummy };
  }

  const width = 1024;
  const height = 512;

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

  const rawPrimary = hexToRgb(customization.primaryColor);
  const rawSecondary = hexToRgb(customization.secondaryColor);
  const cAccent = hexToRgb(customization.accentColor);

  const archetype: PlanetArchetype = customization.archetype || "gas_giant";

  // Deterministic per-palette variation seed (storm placement, maria drift).
  const seed = ((rawPrimary.r * 7 + rawPrimary.g * 13 + rawPrimary.b * 29) % 100) / 100;

  for (let y = 0; y < height; y++) {
    const v = y / height; // 0 to 1 along latitude
    const lat = (v - 0.5) * 2; // -1 at pole, 0 at equator, 1 at pole

    for (let x = 0; x < width; x++) {
      const u = x / width; // 0 to 1 along longitude
      const idx = (y * width + x) * 4;

      // Shared fine detail sampled once per pixel and reused below.
      const mottle = fbm(u * 24 + 7.3, v * 24 + 2.9, 4);
      const grain = smoothNoise(u * 110, v * 110);
      const drift = fbm(u * 2.1 + 13.7, v * 2.1 + 7.9, 3);

      let colorRgb: RGB = { r: 128, g: 128, b: 128 };
      let bumpVal = 128;
      // Roughness maps are centered near white: the scalar roughness
      // multiplies them, so Studio relief/roughness sliders stay live.
      let roughVal = 230;

      if (archetype === "gas_giant") {
        // Bespin-like: muted turbulent bands + oval storms with bright cores.
        const cPrimary = mute(rawPrimary, 0.18);
        const cSecondary = mute(rawSecondary, 0.18);
        const w = warp2(u, v, 3, 5.2, 1.3);
        const bandCoord = v * Math.PI * 10 + (fbm(w.x * 6, w.y * 3, 4) - 0.5) * 2.4;
        const wave1 = Math.sin(bandCoord + Math.sin(u * Math.PI * 4 + fbm(w.x * 5, w.y * 5, 3) * 4) * 0.4);
        const wave2 = Math.cos(bandCoord * 1.8 + Math.cos(u * Math.PI * 6) * 0.25);
        const turbulence = fbm(w.x * 12, w.y * 6, 5) * 0.4;
        const tBand = (wave1 * 0.55 + wave2 * 0.45 + turbulence + 1) * 0.5;

        if (tBand > 0.65) {
          const factor = (tBand - 0.65) / 0.35;
          colorRgb = lerpColor(cSecondary, cAccent, Math.min(1, factor * 1.1));
        } else if (tBand > 0.35) {
          const factor = (tBand - 0.35) / 0.3;
          colorRgb = lerpColor(cPrimary, cSecondary, factor);
        } else {
          const factor = tBand / 0.35;
          colorRgb = lerpColor({ r: Math.round(cPrimary.r * 0.62), g: Math.round(cPrimary.g * 0.62), b: Math.round(cPrimary.b * 0.62) }, cPrimary, factor);
        }

        // Oval storms: elliptical masks with swirled rims and pale cores.
        const storms = [
          { su: 0.18 + seed * 0.35, sv: 0.34 + seed * 0.1, ru: 0.115, rv: 0.075 },
          { su: 0.62 - seed * 0.2, sv: 0.62, ru: 0.085, rv: 0.058 },
        ];
        let stormCore = 0;
        for (const st of storms) {
          let du = Math.abs(u - st.su);
          if (du > 0.5) du = 1 - du; // wrap longitude
          const dv = v - st.sv;
          const d = Math.sqrt((du * du) / (st.ru * st.ru) + (dv * dv) / (st.rv * st.rv));
          if (d < 1) {
            const swirl = 0.5 + 0.5 * Math.sin(d * 11 - turbulence * 9);
            const rimMix = smoothstep(1, 0.55, d) * (0.45 + 0.3 * swirl);
            colorRgb = lerpColor(colorRgb, cSecondary, Math.min(1, rimMix));
            const core = smoothstep(0.42, 0.1, d);
            stormCore = Math.max(stormCore, smoothstep(0.5, 0.1, d));
            colorRgb = lerpColor(colorRgb, { r: Math.min(255, cAccent.r + 40), g: Math.min(255, cAccent.g + 40), b: Math.min(255, cAccent.b + 40) }, core * 0.85);
            bumpVal -= Math.round(core * 25);
          }
        }

        bumpVal = Math.round(128 + wave1 * 18 + (turbulence - 0.2) * 40);
        roughVal = Math.round(195 + turbulence * 60 - stormCore * 60); // calm glossy cores vs rough wakes
      } else if (archetype === "rocky") {
        // Jedha/Nevarro-like: muted regolith, rimmed craters, dark maria plains.
        const cPrimary = mute(rawPrimary, 0.16);
        const cSecondary = mute(rawSecondary, 0.16);
        const w = warp2(u, v, 4, 2.9, 7.7);
        const macroRelief = fbm(w.x * 4.5, w.y * 4.5, 6);
        const detail = fbm(w.x * 18 + 9.1, w.y * 18 + 4.4, 5);
        const craterNoise = smoothNoise(w.x * 15, w.y * 15);
        const craterShape = Math.abs(Math.sin(craterNoise * Math.PI * 3));
        const crater = Math.pow(craterShape, 2.5);
        // Bright rim ring + shadowed bowl per crater.
        const rim = smoothstep(0.72, 0.9, craterShape) - smoothstep(0.9, 0.99, craterShape);
        const bowl = smoothstep(0.72, 0.25, craterShape);
        const elevation = Math.pow(Math.max(0, Math.min(1, macroRelief * 0.62 + crater * 0.2 + detail * 0.18)), 1.35);

        if (elevation > 0.6) {
          const t = (elevation - 0.6) / 0.4;
          colorRgb = lerpColor(cSecondary, cAccent, Math.min(1, t * 1.15));
        } else {
          const t = elevation / 0.6;
          colorRgb = lerpColor(cPrimary, cSecondary, t);
        }
        // Dark basaltic maria plains in low basins.
        const maria = smoothstep(0.56, 0.74, fbm(u * 3 + 11.7, v * 3 + 5.2, 4)) * smoothstep(0.45, 0.25, elevation);
        colorRgb = {
          r: Math.round(colorRgb.r * (1 - maria * 0.28)),
          g: Math.round(colorRgb.g * (1 - maria * 0.28)),
          b: Math.round(colorRgb.b * (1 - maria * 0.24)),
        };
        // Crater rims catch light; bowls sit in shadow.
        colorRgb = lerpColor(colorRgb, { r: Math.min(255, cAccent.r + 25), g: Math.min(255, cAccent.g + 25), b: Math.min(255, cAccent.b + 25) }, rim * 0.35);
        colorRgb = {
          r: Math.round(colorRgb.r * (1 - bowl * 0.22)),
          g: Math.round(colorRgb.g * (1 - bowl * 0.22)),
          b: Math.round(colorRgb.b * (1 - bowl * 0.22)),
        };

        bumpVal = Math.round(Math.max(0, Math.min(1, elevation)) * 255 + rim * 45 - bowl * 30);
        const pond = smoothstep(0.42, 0.25, detail) * smoothstep(0.4, 0.2, elevation);
        roughVal = Math.round(255 - pond * 105 - maria * 25); // glassy dust ponds vs matte crags
      } else if (archetype === "oceanic") {
        // Scarif/Mon Cala-like: hard coastlines, depth-graded oceans, polar caps.
        const cPrimary = mute(rawPrimary, 0.1);
        const cSecondary = mute(rawSecondary, 0.14);
        const w = warp2(u, v, 3, 8.8, 3.1);
        const landmass = fbm(w.x * 3.2, w.y * 3.2, 5);
        const cloudSwirl = fbm(w.x * 10 + 2.1, w.y * 6 + 1.2, 4);
        const capNoise = (fbm(u * 6 + 3.3, v * 6 + 9.9, 3) - 0.5) * 0.12;
        const cap = smoothstep(0.74, 0.86, Math.abs(lat) + capNoise);

        const isLand = landmass > 0.52;
        if (cap > 0) {
          // Polar ice cap with frosted interior.
          colorRgb = lerpColor(lerpColor(cSecondary, cAccent, 0.55), { r: 238, g: 244, b: 250 }, cap * 0.75);
          bumpVal = Math.round(190 + cap * 40);
          roughVal = Math.round(200 - cap * 30);
        } else if (isLand) {
          const t = (landmass - 0.52) / 0.48;
          colorRgb = lerpColor(mute(cSecondary, 0.15), cAccent, t * 0.7);
          bumpVal = Math.round(160 + t * 90);
          roughVal = Math.round(215 + t * 40);
        } else if (landmass > 0.485) {
          // Narrow shallow shelf — hard coastline, no mushy blend.
          const t = (landmass - 0.485) / 0.035;
          colorRgb = lerpColor(cPrimary, cSecondary, 0.25 + t * 0.45);
          bumpVal = 95;
          roughVal = 130;
        } else {
          // Depth-graded ocean: abyss darker and greyer than sunlit shallows.
          const depth = smoothstep(0.485, 0.15, landmass);
          const deep = mute({ r: Math.round(cPrimary.r * 0.45), g: Math.round(cPrimary.g * 0.45), b: Math.round(cPrimary.b * 0.45) }, 0.25);
          colorRgb = lerpColor(cPrimary, deep, depth);
          bumpVal = 55;
          roughVal = Math.round(45 + depth * 25 + (mottle - 0.5) * 50); // streaky water
        }

        // Broken cloud deck, kept off the caps.
        if (cloudSwirl > 0.6 && cap < 0.4) {
          const cloudFactor = (cloudSwirl - 0.6) / 0.4;
          const broken = smoothstep(0.35, 0.75, fbm(u * 18 + 1.1, v * 18 + 6.6, 3));
          const cover = cloudFactor * (0.35 + 0.65 * broken);
          colorRgb = lerpColor(colorRgb, { r: 244, g: 247, b: 252 }, cover * 0.75);
          roughVal = Math.round(roughVal * (1 - cover * 0.4) + 205 * cover * 0.4);
        }
      } else if (archetype === "volcanic") {
        // Mustafar-like: grey basalt crust, glowing fissures, ember speckle.
        const cPrimary = mute(rawPrimary, 0.32);
        const cSecondary = mute(rawSecondary, 0.2);
        const w = warp2(u, v, 4, 4.4, 9.9);
        const plates = fbm(w.x * 4, w.y * 4, 5);
        const fissure = Math.abs(smoothNoise(w.x * 22, w.y * 22) - 0.5) * 2;
        const isLava = fissure < 0.16;

        if (isLava) {
          const lavaHeat = 1 - fissure / 0.16;
          colorRgb = lerpColor(cSecondary, cAccent, Math.min(1, 0.35 + lavaHeat * 0.65));
          bumpVal = 40; // Depressed rift trench
          roughVal = Math.round(30 + lavaHeat * 20); // molten glass
        } else if (fissure < 0.3) {
          // Cooling halo: crust → ember → lava approaching the rift.
          const halo = 1 - (fissure - 0.16) / 0.14;
          const crust = lerpColor(cPrimary, { r: Math.round(cPrimary.r * 0.45), g: Math.round(cPrimary.g * 0.45), b: Math.round(cPrimary.b * 0.45) }, plates);
          colorRgb = lerpColor(crust, cSecondary, halo * 0.75);
          bumpVal = Math.round(140 + plates * 60);
          roughVal = Math.round(190 - halo * 60);
        } else {
          colorRgb = lerpColor(cPrimary, { r: Math.round(cPrimary.r * 0.45), g: Math.round(cPrimary.g * 0.45), b: Math.round(cPrimary.b * 0.45) }, plates);
          // Wind-blown ash streaks across the crust.
          const ash = smoothstep(0.55, 0.85, fbm(u * 16 + 9.7, v * 5 + 2.2, 3));
          colorRgb = lerpColor(colorRgb, { r: 120, g: 118, b: 116 }, ash * 0.3);
          bumpVal = Math.round(180 + plates * 70);
          roughVal = Math.round(235 + plates * 20); // matte carbonized crust
        }
        // Ember speckle scattered near active rifts.
        if (!isLava && fissure < 0.45) {
          const ember = smoothstep(0.93, 0.99, smoothNoise(u * 140 + 3.1, v * 140 + 8.7));
          if (ember > 0) {
            colorRgb = lerpColor(colorRgb, cAccent, ember * 0.8);
            bumpVal += Math.round(ember * 30);
            roughVal = Math.round(roughVal * (1 - ember * 0.7) + 40 * ember * 0.7);
          }
        }
      } else {
        // Hoth/Ilum-like: blue-shadowed frost, crack network, pressure ridges.
        const cPrimary = mute(rawPrimary, 0.14);
        const cSecondary = mute(rawSecondary, 0.14);
        const w = warp2(u, v, 3, 6.6, 5.5);
        const polar = Math.abs(lat);
        const iceStrata = Math.sin((v + (fbm(w.x * 4, w.y * 4, 3) - 0.5) * 0.2) * Math.PI * 8) * 0.08;
        const haze = fbm(w.x * 6, w.y * 6, 4) * 0.15;
        const tIce = Math.max(0, Math.min(1, polar * 0.6 + iceStrata + haze + 0.2));

        if (tIce > 0.6) {
          const factor = (tIce - 0.6) / 0.4;
          colorRgb = lerpColor(cSecondary, cAccent, Math.min(1, factor * 1.1));
        } else {
          const factor = tIce / 0.6;
          colorRgb = lerpColor(cPrimary, cSecondary, factor);
        }
        // Frost crack network: thin dark blue-shadowed grooves.
        const ridge = 1 - Math.abs(2 * fbm(u * 14 + 1.2, v * 14 + 6.8, 4) - 1);
        const crack = smoothstep(0.9, 0.985, ridge);
        if (crack > 0) {
          const shadow = mute({ r: Math.round(cPrimary.r * 0.5), g: Math.round(cPrimary.g * 0.55), b: Math.round(cPrimary.b * 0.7) }, 0.1);
          colorRgb = lerpColor(colorRgb, shadow, crack * 0.7);
        }
        // Wind-carved sastrugi streaks.
        const sastrugi = smoothstep(0.6, 0.9, fbm(u * 30 + 4.8, v * 7 + 1.9, 3));
        colorRgb = lerpColor(colorRgb, { r: 235, g: 242, b: 250 }, sastrugi * 0.18);

        bumpVal = Math.round(128 + iceStrata * 60 - crack * 70 + sastrugi * 25);
        roughVal = Math.round(165 + haze * 120 + crack * 40 - sastrugi * 35); // wind-polished streaks vs chalk
      }

      colorRgb = finishColor(colorRgb, mottle, grain, drift, lat);

      cData[idx] = colorRgb.r;
      cData[idx + 1] = colorRgb.g;
      cData[idx + 2] = colorRgb.b;
      cData[idx + 3] = 255;

      // Micro grain folded into relief so the bump reads at all distances.
      bumpVal = clamp255(bumpVal + (grain - 0.5) * 22 + (mottle - 0.5) * 14 + (drift - 0.5) * 36);
      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;

      rData[idx] = clamp255(roughVal);
      rData[idx + 1] = clamp255(roughVal);
      rData[idx + 2] = clamp255(roughVal);
      rData[idx + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.generateMipmaps = true;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.magFilter = THREE.LinearFilter;
  colorMap.anisotropy = 4;
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.generateMipmaps = true;
  bumpMap.minFilter = THREE.LinearMipmapLinearFilter;
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.generateMipmaps = true;
  roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
  roughnessMap.needsUpdate = true;

  const result = { colorMap, bumpMap, roughnessMap };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Generates a dynamic concentric ring texture matching the selected ring style
 */
export function generateExoplanetRingTexture(
  style: RingStyle,
  colorHex: string
): THREE.CanvasTexture {
  const cacheKey = `${TEXTURE_GEN_VERSION}_ring_${style}_${colorHex}`;
  if (ringTextureCache.has(cacheKey)) {
    return ringTextureCache.get(cacheKey)!;
  }

  if (typeof window === "undefined") {
    return new THREE.CanvasTexture(document.createElement("canvas"));
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const rgb = hexToRgb(colorHex);

  const grad = ctx.createLinearGradient(0, 0, 1024, 0);

  if (style === "saturnian") {
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.12, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);
    grad.addColorStop(0.35, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`);
    grad.addColorStop(0.48, "rgba(0,0,0,0.04)"); // Cassini division gap
    grad.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
    grad.addColorStop(0.85, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
  } else if (style === "ice") {
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.2, `rgba(200, 240, 255, 0.4)`);
    grad.addColorStop(0.5, `rgba(230, 250, 255, 0.9)`);
    grad.addColorStop(0.8, `rgba(180, 225, 255, 0.4)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
  } else if (style === "meridian") {
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.42, "rgba(0,0,0,0)");
    grad.addColorStop(0.48, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
    grad.addColorStop(0.52, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
    grad.addColorStop(0.58, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    // Dust ring
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.25, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);
    grad.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    grad.addColorStop(0.75, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  ringTextureCache.set(cacheKey, texture);
  return texture;
}
