import * as THREE from "three";
import { SpecialistId } from "@/types/orbit";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ZenAtmospherePalette {
  deep: RGB;
  mid: RGB;
  soft: RGB;
  haze: RGB;
  fresnel: RGB;
  cloudFreq: number;
  bandFreq: number;
}

// Calm, ethereal, minimalist celestial palettes inspired by Perplexity Zen & Apple spatial design
const ZEN_PALETTES: Record<string, ZenAtmospherePalette> = {
  core: {
    // Luminous Solar Plasma & Warm Amber
    deep: { r: 180, g: 83, b: 9 },      // Deep amber
    mid: { r: 245, g: 158, b: 11 },     // Radiant gold
    soft: { r: 251, g: 191, b: 36 },    // Bright solar amber
    haze: { r: 254, g: 243, b: 199 },   // Luminous white-gold corona
    fresnel: { r: 255, g: 251, b: 235 },
    cloudFreq: 3.2,
    bandFreq: 2.0,
  },
  health: {
    // Serene Ocean Teal & Emerald Atmospheric Mist
    deep: { r: 15, g: 45, b: 48 },      // Deep abyssal teal
    mid: { r: 13, g: 110, b: 100 },     // Calm seafoam emerald
    soft: { r: 20, g: 184, b: 166 },    // Atmospheric teal wash
    haze: { r: 153, g: 246, b: 228 },   // Soft equatorial cirrus
    fresnel: { r: 204, g: 251, b: 241 },
    cloudFreq: 4.0,
    bandFreq: 3.5,
  },
  move: {
    // Warm Terracotta & Amber Basalt
    deep: { r: 67, g: 20, b: 7 },       // Deep canyon shadow
    mid: { r: 180, g: 65, b: 24 },      // Warm terracotta
    soft: { r: 234, g: 88, b: 12 },     // Amber crest
    haze: { r: 254, g: 215, b: 170 },   // Fine dust haze
    fresnel: { r: 255, g: 237, b: 213 },
    cloudFreq: 3.8,
    bandFreq: 4.2,
  },
  schedule: {
    // Sapphire Dusk & Deep Navy Meridian
    deep: { r: 10, g: 20, b: 45 },      // Deep navy
    mid: { r: 30, g: 64, b: 145 },      // Sapphire dusk
    soft: { r: 56, g: 120, b: 200 },    // Radiant azure
    haze: { r: 186, g: 230, b: 253 },   // Cyan meridian striation
    fresnel: { r: 224, g: 242, b: 254 },
    cloudFreq: 3.5,
    bandFreq: 5.0,
  },
  study: {
    // Crystalline Ice Giant Azure
    deep: { r: 12, g: 40, b: 75 },      // Deep cobalt
    mid: { r: 28, g: 100, b: 165 },     // Azure strata
    soft: { r: 56, g: 189, b: 248 },    // Crystalline cyan
    haze: { r: 207, g: 250, b: 254 },   // Methane ice haze
    fresnel: { r: 240, g: 253, b: 255 },
    cloudFreq: 2.8,
    bandFreq: 6.0,
  },
  wallet: {
    // Titanium & Soft Warm Gold Gas Giant
    deep: { r: 30, g: 32, b: 42 },      // Dark titanium
    mid: { r: 75, g: 80, b: 98 },       // Brushed steel
    soft: { r: 202, g: 160, b: 85 },    // Soft satin gold
    haze: { r: 245, g: 228, b: 185 },   // Golden atmospheric band
    fresnel: { r: 254, g: 249, b: 235 },
    cloudFreq: 2.5,
    bandFreq: 7.2,
  },
  deals: {
    // Celadon & Opalite Moonlet
    deep: { r: 15, g: 45, b: 35 },
    mid: { r: 40, g: 115, b: 90 },
    soft: { r: 110, g: 195, b: 165 },
    haze: { r: 209, g: 250, b: 229 },
    fresnel: { r: 236, g: 253, b: 245 },
    cloudFreq: 3.0,
    bandFreq: 2.0,
  },
  explore: {
    // Amethyst Dusk & Obsidian Violet
    deep: { r: 28, g: 15, b: 50 },      // Midnight violet
    mid: { r: 90, g: 45, b: 140 },      // Amethyst dusk
    soft: { r: 147, g: 85, b: 215 },    // Violet atmospheric wash
    haze: { r: 233, g: 213, b: 255 },   // Ethereal nebula haze
    fresnel: { r: 250, g: 245, b: 255 },
    cloudFreq: 3.4,
    bandFreq: 3.8,
  },
  travel: {
    // Atmospheric Azure & Soft Cloud Strata
    deep: { r: 15, g: 35, b: 70 },      // Deep sky twilight
    mid: { r: 37, g: 99, b: 185 },      // Azure atmosphere
    soft: { r: 96, g: 165, b: 250 },    // Soft daytime blue
    haze: { r: 224, g: 242, b: 254 },   // Soft cloud feathering
    fresnel: { r: 241, g: 248, b: 255 },
    cloudFreq: 4.2,
    bandFreq: 4.5,
  },
  career: {
    // Midnight Graphite & Silver-Blue Sheen
    deep: { r: 15, g: 18, b: 26 },      // Deep graphite
    mid: { r: 45, g: 55, b: 78 },       // Slate blue
    soft: { r: 100, g: 116, b: 148 },   // Brushed silver
    haze: { r: 203, g: 213, b: 225 },   // Atmospheric silver limb
    fresnel: { r: 241, g: 245, b: 249 },
    cloudFreq: 3.0,
    bandFreq: 4.0,
  },
  build: {
    // Brushed Meteorite Alloy Moonlet
    deep: { r: 20, g: 24, b: 32 },
    mid: { r: 55, g: 65, b: 82 },
    soft: { r: 125, g: 138, b: 160 },
    haze: { r: 226, g: 232, b: 240 },
    fresnel: { r: 248, g: 250, b: 252 },
    cloudFreq: 3.2,
    bandFreq: 3.0,
  },
};

const zenTextureCache = new Map<string, THREE.CanvasTexture>();

function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  const clampT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * clampT),
    g: Math.round(c1.g + (c2.g - c1.g) * clampT),
    b: Math.round(c1.b + (c2.b - c1.b) * clampT),
  };
}

// Smooth multi-octave harmonic synthesis for silky atmospheric clouds
function harmonicNoise(u: number, v: number, freq: number): number {
  const nx = u * Math.PI * 2;
  const ny = v * Math.PI;

  const h1 = Math.sin(nx * freq + Math.cos(ny * 2.0) * 1.5) * 0.5 + 0.5;
  const h2 = Math.sin(nx * (freq * 2.1) + ny * 3.2) * 0.25 + 0.25;
  const h3 = Math.cos(ny * (freq * 1.6) + nx * 1.8) * 0.25 + 0.25;

  return h1 * 0.55 + h2 * 0.25 + h3 * 0.2;
}

/**
 * Generates an ethereal, calm, minimalist celestial texture inspired by Perplexity Zen.
 * Features smooth atmospheric gradients, subtle cloud stratification, and soft limb falloff.
 */
export function generateZenPlanetTexture(id: SpecialistId | string): THREE.CanvasTexture {
  const cached = zenTextureCache.get(id);
  if (cached) return cached;

  if (typeof window === "undefined") {
    return new THREE.CanvasTexture(document.createElement("canvas"));
  }

  const palette = ZEN_PALETTES[id] || ZEN_PALETTES.core;
  const width = 1024;
  const height = 512;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    // Latitudinal coordinate (-1 at south pole, 0 at equator, +1 at north pole)
    const lat = Math.cos(v * Math.PI);
    // Smooth atmospheric banding along latitudes
    const bandSine = Math.sin(v * Math.PI * palette.bandFreq);
    const bandSoft = Math.pow(Math.abs(bandSine), 0.85);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const idx = (y * width + x) * 4;

      // Silky cloud flow without jagged turbulence
      const cloudVal = harmonicNoise(u, v, palette.cloudFreq);

      // Atmospheric blend: base latitude gradient + subtle cloud wisps
      const atmosphereFactor = (1 - Math.abs(lat) * 0.35) * 0.65 + cloudVal * 0.35;
      const bandFactor = bandSoft * 0.25 + cloudVal * 0.75;

      let col: RGB;
      if (bandFactor > 0.68) {
        const t = (bandFactor - 0.68) / 0.32;
        col = lerpColor(palette.soft, palette.haze, t);
      } else if (bandFactor > 0.35) {
        const t = (bandFactor - 0.35) / 0.33;
        col = lerpColor(palette.mid, palette.soft, t);
      } else {
        const t = bandFactor / 0.35;
        col = lerpColor(palette.deep, palette.mid, t);
      }

      // Soft limb edge lightening
      const limbSoftness = Math.pow(Math.sin(v * Math.PI), 0.4);
      col = lerpColor(palette.deep, col, limbSoftness * 0.85 + 0.15);

      data[idx] = col.r;
      data[idx + 1] = col.g;
      data[idx + 2] = col.b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  zenTextureCache.set(id, texture);
  return texture;
}

/**
 * Generates an ultra-delicate, gossamer concentric ring texture for celestial bodies.
 * Features soft radial feathering, delicate micro-divisions, and high optical elegance.
 */
export function generateZenRingTexture(colorHex: string): THREE.CanvasTexture {
  const cacheKey = `zen_ring_${colorHex}`;
  const cached = zenTextureCache.get(cacheKey);
  if (cached) return cached;

  if (typeof window === "undefined") {
    return new THREE.CanvasTexture(document.createElement("canvas"));
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const baseCol = new THREE.Color(colorHex);
  const r = Math.round(baseCol.r * 255);
  const g = Math.round(baseCol.g * 255);
  const b = Math.round(baseCol.b * 255);

  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.08, `rgba(${r}, ${g}, ${b}, 0.2)`);
  grad.addColorStop(0.24, `rgba(${r}, ${g}, ${b}, 0.6)`);
  grad.addColorStop(0.46, `rgba(${r}, ${g}, ${b}, 0.75)`);
  grad.addColorStop(0.50, `rgba(${r}, ${g}, ${b}, 0.08)`); // Cassini-style division
  grad.addColorStop(0.54, `rgba(${r}, ${g}, ${b}, 0.8)`);
  grad.addColorStop(0.78, `rgba(${r}, ${g}, ${b}, 0.55)`);
  grad.addColorStop(0.92, `rgba(${r}, ${g}, ${b}, 0.25)`);
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  zenTextureCache.set(cacheKey, texture);
  return texture;
}
