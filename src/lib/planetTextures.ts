import * as THREE from "three";
import { SpecialistId } from "@/types/orbit";

// High-fidelity procedural planetary texture generator
// Produces realistic terrestrial geology, gas giant atmospheric strata, and physical ring systems

function pseudoNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = pseudoNoise(i, j);
  const n10 = pseudoNoise(i + 1, j);
  const n01 = pseudoNoise(i, j + 1);
  const n11 = pseudoNoise(i + 1, j + 1);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;

  return nx0 * (1 - sy) + nx1 * sy;
}

function fbm(x: number, y: number, octaves: number = 5): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let o = 0; o < octaves; o++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2.05;
    amp *= 0.48;
  }
  return val;
}

// Domain-warped FBM for organic cloud/fluid flow
function warpedFbm(x: number, y: number): number {
  const qx = fbm(x + 0.0, y + 0.0, 4);
  const qy = fbm(x + 5.2, y + 1.3, 4);
  return fbm(x + 3.0 * qx, y + 3.0 * qy, 4);
}

interface ColorStop {
  r: number;
  g: number;
  b: number;
}

const textureCache = new Map<string, { map: THREE.CanvasTexture; bump: THREE.CanvasTexture; roughness: THREE.CanvasTexture }>();
const ringCache = new Map<string, THREE.CanvasTexture>();

export function generatePlanetTextures(id: SpecialistId): {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  if (typeof window === "undefined") {
    const c = new THREE.CanvasTexture(document.createElement("canvas"));
    return { map: c, bump: c, roughness: c };
  }

  if (textureCache.has(id)) {
    return textureCache.get(id)!;
  }

  const width = 1024;
  const height = 512;

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = width;
  colorCanvas.height = height;
  const colorCtx = colorCanvas.getContext("2d")!;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext("2d")!;

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext("2d")!;

  const colorImg = colorCtx.createImageData(width, height);
  const bumpImg = bumpCtx.createImageData(width, height);
  const roughImg = roughCtx.createImageData(width, height);

  // Palettes tuned to realistic celestial bodies with refined, desaturated luxury tones
  let c0: ColorStop = { r: 24, g: 14, b: 12 };
  let c1: ColorStop = { r: 128, g: 58, b: 40 };
  let c2: ColorStop = { r: 195, g: 110, b: 85 };
  let c3: ColorStop = { r: 230, g: 165, b: 140 };

  let isGasGiant = false;
  let hasAtmosphereBands = false;
  let bandFreq = 0.0;
  let noiseFreq = 12.0;

  switch (id) {
    case "move":
      // Terracotta Mars: Iron-rich basalt trenches, oxidized dunes, high canyon ridges
      c0 = { r: 28, g: 14, b: 10 };
      c1 = { r: 130, g: 55, b: 38 };
      c2 = { r: 185, g: 95, b: 68 };
      c3 = { r: 220, g: 140, b: 105 };
      noiseFreq = 14.0;
      break;

    case "health":
      // Gaia / Oceanic: Deep midnight blue oceans, coastal azure shelves, muted moss landmasses
      c0 = { r: 8, g: 26, b: 58 };     // Deep ocean
      c1 = { r: 18, g: 74, b: 110 };   // Continental shelf
      c2 = { r: 42, g: 95, b: 68 };    // Muted flora
      c3 = { r: 120, g: 135, b: 105 }; // Highland plateaus
      noiseFreq = 8.0;
      break;

    case "schedule":
      // Chrono Titanium: Architectural slate, deep navy, subtle cyan meridian striations
      c0 = { r: 12, g: 22, b: 34 };
      c1 = { r: 35, g: 65, b: 90 };
      c2 = { r: 70, g: 125, b: 155 };
      c3 = { r: 140, g: 200, b: 225 };
      hasAtmosphereBands = true;
      bandFreq = 16.0;
      noiseFreq = 10.0;
      break;

    case "study":
      // Ice Giant: Azure-cyan stratified atmosphere with crystalline methane clouds
      isGasGiant = true;
      c0 = { r: 10, g: 25, b: 55 };
      c1 = { r: 28, g: 75, b: 140 };
      c2 = { r: 75, g: 145, b: 205 };
      c3 = { r: 165, g: 215, b: 245 };
      hasAtmosphereBands = true;
      bandFreq = 22.0;
      noiseFreq = 6.0;
      break;

    case "wallet":
      // Saturnian Sand / Gold: Refined amber-ochre gas bands with delicate laminar flow
      isGasGiant = true;
      c0 = { r: 45, g: 30, b: 16 };
      c1 = { r: 145, g: 105, b: 55 };
      c2 = { r: 205, g: 165, b: 100 };
      c3 = { r: 238, g: 205, b: 145 };
      hasAtmosphereBands = true;
      bandFreq = 28.0;
      noiseFreq = 7.0;
      break;

    case "deals":
      // Emerald Celadon Moonlet
      c0 = { r: 12, g: 32, b: 26 };
      c1 = { r: 38, g: 95, b: 78 };
      c2 = { r: 90, g: 160, b: 135 };
      c3 = { r: 160, g: 210, b: 190 };
      noiseFreq = 16.0;
      break;

    case "explore":
      // Amethyst Basalt: Muted deep violet dusk with slate-charcoal plains
      c0 = { r: 22, g: 15, b: 32 };
      c1 = { r: 75, g: 45, b: 105 };
      c2 = { r: 135, g: 90, b: 175 };
      c3 = { r: 190, g: 150, b: 220 };
      noiseFreq = 11.0;
      break;

    case "travel":
      // Oceanic Azure Giant: Jet-stream atmospheric cloud bands
      isGasGiant = true;
      c0 = { r: 10, g: 30, b: 52 };
      c1 = { r: 25, g: 85, b: 145 };
      c2 = { r: 80, g: 155, b: 210 };
      c3 = { r: 160, g: 215, b: 245 };
      hasAtmosphereBands = true;
      bandFreq = 18.0;
      noiseFreq = 8.0;
      break;

    case "career":
      // Basalt Titanium: Carbon slate with brushed silver-blue sheen
      c0 = { r: 16, g: 18, b: 24 };
      c1 = { r: 52, g: 58, b: 78 };
      c2 = { r: 110, g: 118, b: 145 };
      c3 = { r: 175, g: 185, b: 210 };
      noiseFreq = 16.0;
      break;

    case "build":
      // Meteorite alloy moonlet
      c0 = { r: 18, g: 20, b: 25 };
      c1 = { r: 60, g: 65, b: 78 };
      c2 = { r: 120, g: 128, b: 145 };
      c3 = { r: 185, g: 192, b: 208 };
      noiseFreq = 20.0;
      break;

    default:
      // Orbit Core / Solar Plasma Star
      c0 = { r: 85, g: 28, b: 8 };
      c1 = { r: 205, g: 95, b: 15 };
      c2 = { r: 248, g: 180, b: 55 };
      c3 = { r: 255, g: 245, b: 210 };
      noiseFreq = 10.0;
  }

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    const bandModifier = hasAtmosphereBands
      ? Math.sin(ny * Math.PI * bandFreq + smoothNoise(ny * 10.0, 2.0) * 0.4) * 0.18
      : 0;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      let elevation: number;
      if (isGasGiant) {
        // Fluid warped bands for gas giants
        elevation = warpedFbm(nx * noiseFreq, ny * (noiseFreq * 0.4)) * 0.7 + bandModifier + 0.15;
      } else {
        // Multi-scale geological FBM with fine craters
        const macro = fbm(nx * noiseFreq, ny * noiseFreq, 5);
        const micro = smoothNoise(nx * noiseFreq * 3.0, ny * noiseFreq * 3.0) * 0.12;
        elevation = macro + micro + bandModifier;
      }

      const t = Math.max(0, Math.min(1, elevation));

      // 4-stop natural color interpolation
      let r = 0, g = 0, b = 0;
      if (t < 0.33) {
        const factor = t / 0.33;
        r = c0.r + (c1.r - c0.r) * factor;
        g = c0.g + (c1.g - c0.g) * factor;
        b = c0.b + (c1.b - c0.b) * factor;
      } else if (t < 0.66) {
        const factor = (t - 0.33) / 0.33;
        r = c1.r + (c2.r - c1.r) * factor;
        g = c1.g + (c2.g - c1.g) * factor;
        b = c1.b + (c2.b - c1.b) * factor;
      } else {
        const factor = (t - 0.66) / 0.34;
        r = c2.r + (c3.r - c2.r) * factor;
        g = c2.g + (c3.g - c2.g) * factor;
        b = c2.b + (c3.b - c2.b) * factor;
      }

      colorImg.data[idx] = Math.floor(Math.max(0, Math.min(255, r)));
      colorImg.data[idx + 1] = Math.floor(Math.max(0, Math.min(255, g)));
      colorImg.data[idx + 2] = Math.floor(Math.max(0, Math.min(255, b)));
      colorImg.data[idx + 3] = 255;

      // Bump elevation (softened for gas giants, crisp for rocky surfaces)
      const bumpVal = isGasGiant ? Math.floor(t * 80) : Math.floor(t * 220);
      bumpImg.data[idx] = bumpVal;
      bumpImg.data[idx + 1] = bumpVal;
      bumpImg.data[idx + 2] = bumpVal;
      bumpImg.data[idx + 3] = 255;

      // Roughness: oceans/smooth areas are reflective, mountains/dust are matte
      let roughVal = 180;
      if (id === "health" && t < 0.38) {
        roughVal = 40; // Glossy ocean
      } else if (isGasGiant) {
        roughVal = 130; // Satin gas atmosphere
      } else {
        roughVal = 210; // Matte regolith
      }

      roughImg.data[idx] = roughVal;
      roughImg.data[idx + 1] = roughVal;
      roughImg.data[idx + 2] = roughVal;
      roughImg.data[idx + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.ClampToEdgeWrapping;

  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.ClampToEdgeWrapping;

  const result = { map, bump, roughness };
  textureCache.set(id, result);
  return result;
}

export type RingTheme = "saturn" | "ice" | "dust" | "meridian";

export function generateRingTexture(theme: RingTheme): THREE.CanvasTexture {
  if (typeof window === "undefined") {
    return new THREE.CanvasTexture(document.createElement("canvas"));
  }

  if (ringCache.has(theme)) {
    return ringCache.get(theme)!;
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const imgData = ctx.createImageData(size, size);
  const center = size / 2;

  const innerBound = center * 0.54;
  const outerBound = center * 0.96;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < innerBound || dist > outerBound) {
        imgData.data[idx + 3] = 0;
        continue;
      }

      const radialPos = (dist - innerBound) / (outerBound - innerBound);

      let r = 240, g = 210, b = 170, alpha = 0.5;

      switch (theme) {
        case "saturn": {
          // Delicate Cassini Division gap and micro-striations
          const isCassini = radialPos >= 0.62 && radialPos <= 0.68;
          const isEncke = radialPos >= 0.88 && radialPos <= 0.90;
          const band = Math.sin(radialPos * Math.PI * 36) * 0.2 + Math.sin(radialPos * Math.PI * 72) * 0.1;
          const density = Math.max(0, 0.6 + band);

          r = Math.floor(215 + radialPos * 30);
          g = Math.floor(180 + radialPos * 25);
          b = Math.floor(130 + radialPos * 35);
          alpha = (isCassini || isEncke) ? 0.02 : Math.min(0.72, density * 0.65);
          break;
        }

        case "ice": {
          // Crystal cyan-white ice sheet
          const band = Math.sin(radialPos * Math.PI * 24) * 0.25;
          r = Math.floor(160 + radialPos * 60);
          g = Math.floor(205 + radialPos * 40);
          b = 245;
          alpha = Math.min(0.65, (0.5 + band) * 0.6);
          break;
        }

        case "dust": {
          // Subtle amethyst dust
          const band = Math.sin(radialPos * Math.PI * 18) * 0.25;
          r = Math.floor(170 + radialPos * 35);
          g = Math.floor(135 + radialPos * 25);
          b = Math.floor(215 + radialPos * 30);
          alpha = Math.min(0.55, (0.45 + band) * 0.55);
          break;
        }

        case "meridian": {
          // Thin celestial chronometer track
          const isTick = Math.sin(radialPos * Math.PI * 40) > 0.5;
          r = 56;
          g = 189;
          b = 248;
          alpha = isTick ? 0.65 : 0.15;
          break;
        }
      }

      // Smooth feathering at inner and outer ring boundaries
      const edgeFade =
        Math.min(1, radialPos / 0.07) * Math.min(1, (1 - radialPos) / 0.07);

      imgData.data[idx] = r;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = b;
      imgData.data[idx + 3] = Math.floor(alpha * edgeFade * 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  ringCache.set(theme, texture);
  return texture;
}
