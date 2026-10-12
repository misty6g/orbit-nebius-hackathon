import type { SpecialistId } from "@/types/orbit";

export interface PlanetAsset {
  /** Albedo / day map */
  map: string | null;
  /** Optional transparent cloud shell (currently Earth only) */
  cloudsMap?: string;
  /** Optional photographic ring texture (currently Saturn only) */
  ringMap?: string;
  /** Suggested roughness for the surface material */
  roughness: number;
  /** True for gas / ice giants (smoother, less bump) */
  gasGiant: boolean;
  /** Suggested bump scale when using the albedo as a bump source */
  bumpScale: number;
}

export const MOON_TEXTURE = "/textures/2k_moon.jpg";
export const MILKY_WAY_TEXTURE = "/textures/2k_stars_milky_way.jpg";

const ASSETS: Record<string, PlanetAsset> = {
  health: {
    map: "/textures/2k_earth_daymap.jpg",
    cloudsMap: "/textures/2k_earth_clouds.jpg",
    roughness: 0.85,
    gasGiant: false,
    bumpScale: 0.05,
  },
  move: {
    map: "/textures/2k_mars.jpg",
    roughness: 0.95,
    gasGiant: false,
    bumpScale: 0.08,
  },
  schedule: {
    map: "/textures/2k_mercury.jpg",
    roughness: 1.0,
    gasGiant: false,
    bumpScale: 0.09,
  },
  study: {
    map: "/textures/2k_neptune.jpg",
    roughness: 0.6,
    gasGiant: true,
    bumpScale: 0.02,
  },
  wallet: {
    map: "/textures/2k_saturn.jpg",
    ringMap: "/textures/2k_saturn_ring_alpha.png",
    roughness: 0.6,
    gasGiant: true,
    bumpScale: 0.02,
  },
  explore: {
    map: "/textures/2k_jupiter.jpg",
    roughness: 0.6,
    gasGiant: true,
    bumpScale: 0.02,
  },
  travel: {
    map: "/textures/2k_venus_atmosphere.jpg",
    roughness: 0.6,
    gasGiant: true,
    bumpScale: 0.015,
  },
  career: {
    map: "/textures/2k_moon.jpg",
    roughness: 1.0,
    gasGiant: false,
    bumpScale: 0.09,
  },
  // Moonlet specialists reuse the photographic moon; core keeps its procedural sun.
  deals: {
    map: "/textures/2k_moon.jpg",
    roughness: 1.0,
    gasGiant: false,
    bumpScale: 0.09,
  },
  build: {
    map: "/textures/2k_moon.jpg",
    roughness: 1.0,
    gasGiant: false,
    bumpScale: 0.09,
  },
  core: {
    map: null,
    roughness: 0.32,
    gasGiant: true,
    bumpScale: 0,
  },
};

/**
 * Photographic texture set for a specialist planet.
 * Falls back to the moon texture for unknown ids so every
 * body renders with a real albedo instead of going untextured.
 */
export function getPlanetAsset(id: SpecialistId): PlanetAsset {
  return (
    ASSETS[id] ?? {
      map: MOON_TEXTURE,
      roughness: 0.9,
      gasGiant: false,
      bumpScale: 0.06,
    }
  );
}
