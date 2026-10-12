export type SpecialistId =
  | "core"
  | "health"
  | "move"
  | "schedule"
  | "study"
  | "wallet"
  | "explore"
  | "deals"
  | "travel"
  | "career"
  | "build";

export interface SpecialistConfig {
  id: SpecialistId;
  name: string;
  domain: string;
  tagline: string;
  color: string;
  glowColor: string;
  orbitRadius: number; // distance from Sun
  orbitSpeed: number;
  size: number;
  parentPlanetId?: SpecialistId; // for moonlet orbits
  features: string[];
}

export type PlanetArchetype = "gas_giant" | "rocky" | "oceanic" | "volcanic" | "ice_giant";

export type RingStyle = "none" | "saturnian" | "ice" | "dust" | "meridian";

export interface CustomMoonConfig {
  id: string;
  name: string;
  size: number;
  color: string;
  distance: number;
  speed: number;
}

export interface PlanetCustomization {
  id: SpecialistId;
  archetype: PlanetArchetype;
  /** Deep basins / ocean / band lows */
  primaryColor: string;
  /** Highlands / plates / mid bands */
  secondaryColor: string;
  /** Dust, frost, storm cores, cloud tint */
  accentColor: string;
  /** Baked into albedo relief contrast (MeshBasic soft-lit path). 0–0.5 */
  bumpScale: number;
  /** Surface matte — higher = softer tonal contrast. 0.2–1 */
  roughness: number;
  /** Limb mist strength. 0–1 */
  atmosphereIntensity: number;
  /** Thin cloud / dust veil cover. 0–1 */
  cloudCover: number;
  /** Extra desaturation toward Zen muted earth tones. 0–1 */
  chromaMute: number;
  hasRings: boolean;
  ringStyle: RingStyle;
  ringColor: string;
  ringTilt: number;
  moons: CustomMoonConfig[];
}

/** Merge persisted Studio JSON with current defaults so new knobs stay live. */
export function normalizePlanetCustomization(
  partial: Partial<PlanetCustomization> | undefined,
  fallback: PlanetCustomization
): PlanetCustomization {
  const merged: PlanetCustomization = {
    ...fallback,
    ...partial,
    id: (partial?.id as SpecialistId) || fallback.id,
    moons: Array.isArray(partial?.moons) ? partial!.moons! : fallback.moons,
  };
  if (merged.atmosphereIntensity == null || Number.isNaN(merged.atmosphereIntensity)) {
    merged.atmosphereIntensity = fallback.atmosphereIntensity;
  }
  if (merged.cloudCover == null || Number.isNaN(merged.cloudCover)) {
    merged.cloudCover = fallback.cloudCover;
  }
  if (merged.chromaMute == null || Number.isNaN(merged.chromaMute)) {
    merged.chromaMute = fallback.chromaMute;
  }
  return merged;
}

/** User-tunable NebulaField split colors (persisted in localStorage). */
export interface NebulaCustomization {
  /** Volume on the −X / left side of the sky. */
  leftColor: string;
  /** Volume on the +X / right side of the sky. */
  rightColor: string;
  /** Deep wash between lobes + canvas fog tint. */
  deepColor: string;
}

export const DEFAULT_NEBULA_CUSTOMIZATION: NebulaCustomization = {
  leftColor: "#0369a1",
  rightColor: "#4338ca",
  deepColor: "#0b1020",
};

export const NEBULA_COLOR_PRESETS: Array<{
  id: string;
  label: string;
  colors: NebulaCustomization;
}> = [
  {
    id: "indigo-blue",
    label: "Indigo / Space Blue",
    colors: { leftColor: "#0369a1", rightColor: "#4338ca", deepColor: "#0b1020" },
  },
  {
    id: "zen-teal-rust",
    label: "Teal / Rust (Zen)",
    colors: { leftColor: "#14b8a6", rightColor: "#c2410c", deepColor: "#1a0e28" },
  },
  {
    id: "violet-cyan",
    label: "Violet / Cyan",
    colors: { leftColor: "#0891b2", rightColor: "#7c3aed", deepColor: "#0c0a1a" },
  },
  {
    id: "emerald-amber",
    label: "Emerald / Amber",
    colors: { leftColor: "#059669", rightColor: "#d97706", deepColor: "#0a120e" },
  },
  {
    id: "rose-slate",
    label: "Rose / Slate",
    colors: { leftColor: "#64748b", rightColor: "#e11d48", deepColor: "#0f0a10" },
  },
  {
    id: "mono-void",
    label: "Mono Void",
    colors: { leftColor: "#334155", rightColor: "#1e293b", deepColor: "#05070c" },
  },
];

export const DEFAULT_PLANET_CUSTOMIZATIONS: Record<string, PlanetCustomization> = {
  // Mossy ocean world — desaturated teal, soft archipelagos (Zen).
  health: {
    id: "health",
    archetype: "oceanic",
    primaryColor: "#2a4a4e",
    secondaryColor: "#4a6b52",
    accentColor: "#8a9e88",
    bumpScale: 0.14,
    roughness: 0.82,
    atmosphereIntensity: 0.55,
    cloudCover: 0.35,
    chromaMute: 0.45,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#6b8f7a",
    ringTilt: 0.2,
    moons: [],
  },
  // Rust / ochre rocky hero — Studio palette drives the soft-lit surface.
  move: {
    id: "move",
    archetype: "rocky",
    primaryColor: "#6b3a28",
    secondaryColor: "#a06038",
    accentColor: "#c9a078",
    bumpScale: 0.3,
    roughness: 0.92,
    atmosphereIntensity: 0.4,
    cloudCover: 0.18,
    chromaMute: 0.35,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#a06038",
    ringTilt: 0.15,
    moons: [
      {
        id: "m-move-1",
        name: "Phobos",
        size: 0.22,
        color: "#a89078",
        distance: 2.2,
        speed: 1.4,
      },
    ],
  },
  // Cool slate gas giant — soft bands, no candy stripes.
  schedule: {
    id: "schedule",
    archetype: "gas_giant",
    primaryColor: "#2a3550",
    secondaryColor: "#4a5a78",
    accentColor: "#8a96a8",
    bumpScale: 0.04,
    roughness: 0.88,
    atmosphereIntensity: 0.5,
    cloudCover: 0.2,
    chromaMute: 0.4,
    hasRings: true,
    ringStyle: "meridian",
    ringColor: "#6a7a90",
    ringTilt: 0.35,
    moons: [],
  },
  // Pale ice-haze world.
  study: {
    id: "study",
    archetype: "ice_giant",
    primaryColor: "#4a5e6c",
    secondaryColor: "#7a8e9a",
    accentColor: "#c8d4dc",
    bumpScale: 0.05,
    roughness: 0.62,
    atmosphereIntensity: 0.65,
    cloudCover: 0.45,
    chromaMute: 0.3,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#9ab0b8",
    ringTilt: 0.1,
    moons: [
      {
        id: "m-study-1",
        name: "Mimas",
        size: 0.2,
        color: "#b8c4cc",
        distance: 2.1,
        speed: 1.1,
      },
    ],
  },
  // Warm ochre banded giant — muted storms.
  wallet: {
    id: "wallet",
    archetype: "gas_giant",
    primaryColor: "#4a3a28",
    secondaryColor: "#8a6a40",
    accentColor: "#c4a878",
    bumpScale: 0.04,
    roughness: 0.78,
    atmosphereIntensity: 0.45,
    cloudCover: 0.15,
    chromaMute: 0.38,
    hasRings: true,
    ringStyle: "saturnian",
    ringColor: "#a88858",
    ringTilt: 0.45,
    moons: [
      {
        id: "m-wallet-1",
        name: "Titan",
        size: 0.28,
        color: "#a89878",
        distance: 2.5,
        speed: 0.9,
      },
    ],
  },
  // Basalt volcanic with ember accents (restrained).
  explore: {
    id: "explore",
    archetype: "volcanic",
    primaryColor: "#2e2a34",
    secondaryColor: "#6a3a30",
    accentColor: "#b07048",
    bumpScale: 0.26,
    roughness: 0.9,
    atmosphereIntensity: 0.35,
    cloudCover: 0.08,
    chromaMute: 0.4,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#6a5a70",
    ringTilt: 0.25,
    moons: [],
  },
  // Dusty pale cloud-world.
  travel: {
    id: "travel",
    archetype: "gas_giant",
    primaryColor: "#5a5248",
    secondaryColor: "#8a8070",
    accentColor: "#d0c4b0",
    bumpScale: 0.03,
    roughness: 0.72,
    atmosphereIntensity: 0.55,
    cloudCover: 0.55,
    chromaMute: 0.42,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#a09888",
    ringTilt: 0.15,
    moons: [],
  },
  // Charcoal rocky world.
  career: {
    id: "career",
    archetype: "rocky",
    primaryColor: "#2e3238",
    secondaryColor: "#555a62",
    accentColor: "#9aa0a8",
    bumpScale: 0.3,
    roughness: 0.96,
    atmosphereIntensity: 0.3,
    cloudCover: 0.1,
    chromaMute: 0.45,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#6a7280",
    ringTilt: 0.2,
    moons: [
      {
        id: "m-career-1",
        name: "Apollo",
        size: 0.24,
        color: "#848a92",
        distance: 2.3,
        speed: 1.2,
      },
    ],
  },
};

export interface ActionApproval {
  id: string;
  specialistId: SpecialistId;
  title: string;
  description: string;
  service: "Google Calendar" | "Google Drive" | "Gmail" | "GitHub" | "Job Portal" | "Flight Booking";
  payload: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  safetyCheck: string;
  timestamp: string;
}

export interface SharedBrainProfile {
  student: {
    name: string;
    university: string;
    degree: string;
    gradYear: string;
    campus: string;
    homeAirport: string;
    primaryCalendar: string;
  };
  goals: {
    nutrition: {
      goal: "bulk" | "cut" | "maintain";
      caloriesTarget: number;
      proteinTarget: number;
    };
    workout: {
      split: string;
      frequencyPerWeek: number;
      sports: string[];
    };
    wallet: {
      monthlyBudgetCap: number;
      currency: string;
    };
    career: {
      targetRoles: string[];
      targetSeason: string;
      skills: string[];
    };
  };
  activity: {
    meals: Array<{
      id: string;
      name: string;
      caloriesMin: number;
      caloriesMax: number;
      proteinGrams: number;
      time: string;
    }>;
    workouts: Array<{
      id: string;
      day: string;
      focus: string;
      status: "completed" | "upcoming" | "rest";
      exercises: string[];
    }>;
    calendar: Array<{
      id: string;
      title: string;
      time: string;
      category: "class" | "sports" | "study" | "life";
      isHold?: boolean;
    }>;
    expenses: Array<{
      id: string;
      item: string;
      cost: number;
      category: string;
      date: string;
    }>;
    studyDecks: Array<{
      id: string;
      course: string;
      title: string;
      cards: Array<{
        id: string;
        question: string;
        answer: string;
        mastered: boolean;
      }>;
    }>;
    careerPipeline: Array<{
      id: string;
      company: string;
      role: string;
      stage: "scouted" | "resume-ready" | "staged" | "submitted";
      matchScore: number;
    }>;
  };
  pendingApprovals: ActionApproval[];
}

export interface ChatMessage {
  id: string;
  sender: SpecialistId | "user";
  senderName: string;
  content: string;
  timestamp: string;
  routingTrace?: {
    intent: string;
    targetSpecialists: SpecialistId[];
    modelUsed: string;
    confidence: number;
  };
  approvalRequest?: ActionApproval;
  tavilySources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export interface MorningBriefData {
  date: string;
  greeting: string;
  scheduleHighlights: string[];
  volleyballNotice?: string;
  macroPacing: string;
  budgetStatus: string;
  actionableEmails: string[];
  recommendedHolds: string[];
}
