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

export interface ExoplanetMaterialTextures {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

const textureCache = new Map<string, ExoplanetMaterialTextures>();
const ringTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generates procedural textures matching the Sketchfab Exoplanet collection aesthetic
 */
export function generateExoplanetTextures(
  customization: PlanetCustomization
): ExoplanetMaterialTextures {
  const cacheKey = `${customization.id}_${customization.archetype}_${customization.primaryColor}_${customization.secondaryColor}_${customization.accentColor}`;
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

  const cPrimary = hexToRgb(customization.primaryColor);
  const cSecondary = hexToRgb(customization.secondaryColor);
  const cAccent = hexToRgb(customization.accentColor);

  const archetype: PlanetArchetype = customization.archetype || "gas_giant";

  for (let y = 0; y < height; y++) {
    const v = y / height; // 0 to 1 along latitude
    const lat = (v - 0.5) * 2; // -1 at pole, 0 at equator, 1 at pole

    for (let x = 0; x < width; x++) {
      const u = x / width; // 0 to 1 along longitude
      const idx = (y * width + x) * 4;

      let colorRgb: RGB = { r: 128, g: 128, b: 128 };
      let bumpVal = 128;
      let roughVal = Math.round((customization.roughness || 0.35) * 255);

      if (archetype === "gas_giant") {
        // Exoplanet Gas Giant: Harmonic horizontal cloud bands with fine turbulence
        const bandFreq = 16.0;
        const wave1 = Math.sin(v * Math.PI * bandFreq + Math.sin(u * Math.PI * 4) * 0.15);
        const wave2 = Math.cos(v * Math.PI * (bandFreq * 1.8) + Math.cos(u * Math.PI * 6) * 0.1);
        const turbulence = fbm(u * 12, v * 6, 3) * 0.35;
        const tBand = (wave1 * 0.6 + wave2 * 0.4 + turbulence + 1) * 0.5;

        // Banded color interpolation
        if (tBand > 0.65) {
          const factor = (tBand - 0.65) / 0.35;
          colorRgb = lerpColor(cSecondary, cAccent, factor);
        } else if (tBand > 0.35) {
          const factor = (tBand - 0.35) / 0.3;
          colorRgb = lerpColor(cPrimary, cSecondary, factor);
        } else {
          const factor = tBand / 0.35;
          colorRgb = lerpColor({ r: Math.round(cPrimary.r * 0.6), g: Math.round(cPrimary.g * 0.6), b: Math.round(cPrimary.b * 0.6) }, cPrimary, factor);
        }

        // Atmospheric limb softening
        bumpVal = Math.round(128 + wave1 * 15);
        roughVal = 85;
      } else if (archetype === "rocky") {
        // Exoplanet Cratered Rocky World: Mineral regolith with bump craters
        const macroRelief = fbm(u * 8, v * 8, 5);
        const craterNoise = smoothNoise(u * 28, v * 28);
        const crater = Math.pow(Math.abs(Math.sin(craterNoise * Math.PI * 3)), 2.5);
        const elevation = macroRelief * 0.75 + crater * 0.25;

        if (elevation > 0.6) {
          const t = (elevation - 0.6) / 0.4;
          colorRgb = lerpColor(cSecondary, cAccent, t);
        } else {
          const t = elevation / 0.6;
          colorRgb = lerpColor(cPrimary, cSecondary, t);
        }

        bumpVal = Math.round(elevation * 255);
        roughVal = Math.round(180 + macroRelief * 50);
      } else if (archetype === "oceanic") {
        // Oceanic Terra World: Deep liquid oceans with continents and atmospheric cloud swirls
        const landmass = fbm(u * 5, v * 5, 4);
        const cloudSwirl = fbm(u * 10 + 2.1, v * 6 + 1.2, 3);

        const isLand = landmass > 0.52;
        if (isLand) {
          const t = (landmass - 0.52) / 0.48;
          colorRgb = lerpColor(cSecondary, cAccent, t);
          bumpVal = Math.round(160 + t * 90);
          roughVal = 210;
        } else {
          // Ocean shelf
          const t = landmass / 0.52;
          colorRgb = lerpColor(
            { r: Math.round(cPrimary.r * 0.4), g: Math.round(cPrimary.g * 0.4), b: Math.round(cPrimary.b * 0.4) },
            cPrimary,
            t
          );
          bumpVal = 60;
          roughVal = 35; // Glossy reflective water
        }

        // Overlay clouds
        if (cloudSwirl > 0.62) {
          const cloudFactor = (cloudSwirl - 0.62) / 0.38;
          colorRgb = lerpColor(colorRgb, { r: 250, g: 252, b: 255 }, cloudFactor * 0.7);
          roughVal = Math.round(roughVal * (1 - cloudFactor * 0.5) + 200 * cloudFactor * 0.5);
        }
      } else if (archetype === "volcanic") {
        // Volcanic Magma World: Basalt crust with glowing magma fissures
        const plates = fbm(u * 7, v * 7, 4);
        const fissure = Math.abs(smoothNoise(u * 22, v * 22) - 0.5) * 2;
        const isLava = fissure < 0.16;

        if (isLava) {
          const lavaHeat = 1 - fissure / 0.16;
          colorRgb = lerpColor(cSecondary, cAccent, lavaHeat);
          bumpVal = 40; // Depressed rift trench
          roughVal = 20; // Smooth glowing molten glass
        } else {
          const crustElev = (fissure - 0.16) / 0.84;
          colorRgb = lerpColor(cPrimary, { r: Math.round(cPrimary.r * 0.4), g: Math.round(cPrimary.g * 0.4), b: Math.round(cPrimary.b * 0.4) }, crustElev);
          bumpVal = Math.round(180 + plates * 70);
          roughVal = 230; // Matte carbonized crust
        }
      } else {
        // Ice Giant: Crystalline ethereal gradient with polar frost
        const polar = Math.abs(lat);
        const iceStrata = Math.sin(v * Math.PI * 8) * 0.08;
        const haze = fbm(u * 6, v * 6, 3) * 0.15;
        const tIce = Math.max(0, Math.min(1, polar * 0.6 + iceStrata + haze + 0.2));

        if (tIce > 0.6) {
          const factor = (tIce - 0.6) / 0.4;
          colorRgb = lerpColor(cSecondary, cAccent, factor);
        } else {
          const factor = tIce / 0.6;
          colorRgb = lerpColor(cPrimary, cSecondary, factor);
        }

        bumpVal = Math.round(128 + iceStrata * 60);
        roughVal = 70; // High sheen frosted ice
      }

      cData[idx] = colorRgb.r;
      cData[idx + 1] = colorRgb.g;
      cData[idx + 2] = colorRgb.b;
      cData[idx + 3] = 255;

      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;

      rData[idx] = roughVal;
      rData[idx + 1] = roughVal;
      rData[idx + 2] = roughVal;
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
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
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
  const cacheKey = `ring_${style}_${colorHex}`;
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
