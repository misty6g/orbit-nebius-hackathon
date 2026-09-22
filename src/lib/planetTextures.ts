import * as THREE from "three";
import { SpecialistId } from "@/types/orbit";

// Procedural texture generator for cinematic, high-relief planetary surfaces and rings
// Produces organic marble, rock grain, micro-regolith grit, and bump relief matching the reference aesthetic

// Simple 2D noise implementation for deterministic procedural textures
function pseudoNoise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;

  // Smoothstep interpolation
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

function fbm(x: number, y: number, octaves: number = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let o = 0; o < octaves; o++) {
    val += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  return val;
}

interface ColorStop {
  r: number;
  g: number;
  b: number;
}

const textureCache = new Map<string, { map: THREE.CanvasTexture; bump: THREE.CanvasTexture }>();
const ringCache = new Map<string, THREE.CanvasTexture>();

export function generatePlanetTextures(id: SpecialistId): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  if (typeof window === "undefined") {
    // SSR fallback: empty 1x1 textures
    const c = new THREE.CanvasTexture(document.createElement("canvas"));
    return { map: c, bump: c };
  }

  if (textureCache.has(id)) {
    return textureCache.get(id)!;
  }

  const width = 1024;
  const height = 512;

  // Color map canvas
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = width;
  colorCanvas.height = height;
  const colorCtx = colorCanvas.getContext("2d")!;

  // Bump map canvas
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext("2d")!;

  const colorImg = colorCtx.createImageData(width, height);
  const bumpImg = bumpCtx.createImageData(width, height);

  // 3-stop planetary palette: c0 (deep basin/trench), c1 (mid-rock/body), c2 (high ridge/crater rim)
  let c0: ColorStop = { r: 35, g: 15, b: 12 };
  let c1: ColorStop = { r: 150, g: 60, b: 40 };
  let c2: ColorStop = { r: 215, g: 105, b: 75 };
  let grainFreq = 16.0;
  let bandFreq = 0.0;
  let stippleIntensity = 0.16;

  switch (id) {
    case "move":
      // Terracotta/Rust rock matching the user's reference image
      c0 = { r: 38, g: 16, b: 12 };   // Dark iron-oxide basin
      c1 = { r: 158, g: 62, b: 42 };  // Rich Mars regolith
      c2 = { r: 218, g: 110, b: 80 }; // Sunlit sandstone ridge
      grainFreq = 18.0;
      bandFreq = 2.5;
      stippleIntensity = 0.22;
      break;

    case "health":
      // Earth-like Gaia: deep oceanic trenches, azure coasts, and lush emerald highlands
      c0 = { r: 12, g: 45, b: 85 };   // Deep ocean
      c1 = { r: 25, g: 130, b: 85 };  // Continental flora
      c2 = { r: 140, g: 190, b: 115 }; // Mountain plateaus
      grainFreq = 9.0;
      bandFreq = 1.0;
      stippleIntensity = 0.12;
      break;

    case "schedule":
      // Chrono-metallic cyan, steel blue, and luminescent meridian striations
      c0 = { r: 10, g: 30, b: 55 };
      c1 = { r: 25, g: 120, b: 170 };
      c2 = { r: 85, g: 210, b: 240 };
      grainFreq = 14.0;
      bandFreq = 10.0;
      stippleIntensity = 0.14;
      break;

    case "study":
      // Deep sapphire and ice-giant azure with frosty polar bands
      c0 = { r: 12, g: 22, b: 65 };
      c1 = { r: 35, g: 95, b: 195 };
      c2 = { r: 135, g: 195, b: 255 };
      grainFreq = 11.0;
      bandFreq = 14.0;
      stippleIntensity = 0.15;
      break;

    case "wallet":
      // Golden Saturn ochre, warm amber, and silken planetary bands
      c0 = { r: 60, g: 38, b: 14 };
      c1 = { r: 185, g: 125, b: 45 };
      c2 = { r: 245, g: 200, b: 105 };
      grainFreq = 7.0;
      bandFreq = 24.0;
      stippleIntensity = 0.10;
      break;

    case "deals":
      // Emerald mint satellite
      c0 = { r: 10, g: 45, b: 35 };
      c1 = { r: 25, g: 155, b: 110 };
      c2 = { r: 110, g: 235, b: 180 };
      grainFreq = 16.0;
      bandFreq = 4.0;
      stippleIntensity = 0.18;
      break;

    case "explore":
      // Deep amethyst and cosmic plum with mystical nebula violet ridges
      c0 = { r: 32, g: 12, b: 52 };
      c1 = { r: 125, g: 55, b: 185 };
      c2 = { r: 205, g: 140, b: 250 };
      grainFreq = 12.0;
      bandFreq = 6.0;
      stippleIntensity = 0.16;
      break;

    case "travel":
      // Oceanic atmosphere and jet-stream cloud lines
      c0 = { r: 8, g: 42, b: 78 };
      c1 = { r: 20, g: 135, b: 205 };
      c2 = { r: 125, g: 215, b: 250 };
      grainFreq = 10.0;
      bandFreq = 8.0;
      stippleIntensity = 0.14;
      break;

    case "career":
      // Cyber carbon slate, basalt, and titanium shimmer
      c0 = { r: 18, g: 20, b: 32 };
      c1 = { r: 70, g: 78, b: 115 };
      c2 = { r: 155, g: 165, b: 220 };
      grainFreq = 18.0;
      bandFreq = 4.0;
      stippleIntensity = 0.20;
      break;

    case "build":
      // Titanium alloy meteorite moonlet
      c0 = { r: 24, g: 26, b: 34 };
      c1 = { r: 85, g: 90, b: 110 };
      c2 = { r: 175, g: 180, b: 205 };
      grainFreq = 20.0;
      bandFreq = 2.0;
      stippleIntensity = 0.22;
      break;

    default:
      // Core / Sun Molten gold plasma
      c0 = { r: 120, g: 45, b: 10 };
      c1 = { r: 225, g: 140, b: 20 };
      c2 = { r: 254, g: 240, b: 138 };
      grainFreq = 14.0;
      bandFreq = 3.0;
      stippleIntensity = 0.10;
  }

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    // Wavy atmospheric/geological band modifier
    const bandModifier =
      bandFreq > 0
        ? Math.sin(ny * Math.PI * bandFreq + smoothNoise(ny * 12.0, 1.2) * 0.8) * 0.22
        : 0;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      // Multi-scale FBM for macro ridges, basins, and plateaus
      const n1 = fbm(nx * grainFreq, ny * grainFreq, 4);
      const n2 = smoothNoise(nx * grainFreq * 3.5, ny * grainFreq * 3.5) * 0.18;

      // High-frequency tactile stipple noise matching the reference image's fine grit
      const stipple = (pseudoNoise(x * 2.13, y * 3.71) - 0.5) * stippleIntensity;

      // Combined normalized elevation [0, 1]
      const t = Math.max(0, Math.min(1, n1 + n2 + bandModifier + stipple));

      // 3-stop interpolation
      let r = 0, g = 0, b = 0;
      if (t < 0.5) {
        const factor = t / 0.5;
        r = c0.r + (c1.r - c0.r) * factor;
        g = c0.g + (c1.g - c0.g) * factor;
        b = c0.b + (c1.b - c0.b) * factor;
      } else {
        const factor = (t - 0.5) / 0.5;
        r = c1.r + (c2.r - c1.r) * factor;
        g = c1.g + (c2.g - c1.g) * factor;
        b = c1.b + (c2.b - c1.b) * factor;
      }

      colorImg.data[idx] = Math.floor(Math.max(0, Math.min(255, r)));
      colorImg.data[idx + 1] = Math.floor(Math.max(0, Math.min(255, g)));
      colorImg.data[idx + 2] = Math.floor(Math.max(0, Math.min(255, b)));
      colorImg.data[idx + 3] = 255;

      // Bump elevation (white = high ridge/crater rim, black = deep basin)
      const bumpVal = Math.floor(t * 255);
      bumpImg.data[idx] = bumpVal;
      bumpImg.data[idx + 1] = bumpVal;
      bumpImg.data[idx + 2] = bumpVal;
      bumpImg.data[idx + 3] = 255;
    }
  }

  colorCtx.putImageData(colorImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;

  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.ClampToEdgeWrapping;

  const result = { map, bump };
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

  // Normalized inner/outer boundaries (0.5 to 0.98 of canvas radius)
  const innerBound = center * 0.52;
  const outerBound = center * 0.96;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < innerBound || dist > outerBound) {
        // Outside the ring geometry
        imgData.data[idx + 3] = 0;
        continue;
      }

      // Normalized radial position [0, 1] from inner to outer ring edge
      const radialPos = (dist - innerBound) / (outerBound - innerBound);

      let r = 255, g = 255, b = 255, alpha = 0.5;

      switch (theme) {
        case "saturn": {
          // Warm golden ochre with Cassini division gap
          const isCassini = radialPos >= 0.62 && radialPos <= 0.69;
          const band1 = Math.sin(radialPos * Math.PI * 22) * 0.25;
          const band2 = Math.sin(radialPos * Math.PI * 45) * 0.15;
          const density = Math.max(0, 0.65 + band1 + band2);

          r = 245;
          g = Math.floor(180 + radialPos * 30);
          b = Math.floor(80 + radialPos * 40);
          alpha = isCassini ? 0.05 : Math.min(0.85, density * 0.75);
          break;
        }

        case "ice": {
          // Pale crystal azure and cyan rings with translucent frost
          const band1 = Math.sin(radialPos * Math.PI * 18) * 0.3;
          const density = Math.max(0, 0.55 + band1);

          r = Math.floor(140 + radialPos * 80);
          g = Math.floor(200 + radialPos * 40);
          b = 255;
          alpha = Math.min(0.7, density * 0.65);
          break;
        }

        case "dust": {
          // Cosmic plum and amethyst dust ring
          const band1 = Math.sin(radialPos * Math.PI * 16) * 0.35;
          const density = Math.max(0, 0.5 + band1);

          r = Math.floor(190 + radialPos * 40);
          g = Math.floor(120 + radialPos * 30);
          b = Math.floor(240 + radialPos * 15);
          alpha = Math.min(0.65, density * 0.6);
          break;
        }

        case "meridian": {
          // Precise cyan chrono-orbital ticker ring
          const band1 = Math.sin(radialPos * Math.PI * 32) > 0.3 ? 0.8 : 0.2;
          r = 56;
          g = 189;
          b = 248;
          alpha = band1 * 0.6;
          break;
        }
      }

      // Soft fade at innermost and outermost edges
      const edgeFade =
        Math.min(1, (radialPos / 0.08)) * Math.min(1, ((1 - radialPos) / 0.08));

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
