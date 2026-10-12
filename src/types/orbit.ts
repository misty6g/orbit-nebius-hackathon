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
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bumpScale: number;
  roughness: number;
  hasRings: boolean;
  ringStyle: RingStyle;
  ringColor: string;
  ringTilt: number;
  moons: CustomMoonConfig[];
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
  // Muted teal ocean world with invented archipelagos (not Earth continents).
  health: {
    id: "health",
    archetype: "oceanic",
    primaryColor: "#1a5c66",
    secondaryColor: "#2f8f7a",
    accentColor: "#9fd9c4",
    bumpScale: 0.16,
    roughness: 0.78,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#34d399",
    ringTilt: 0.2,
    moons: [],
  },
  // Rusty mineral terrain — hero AlienPlanet overrides visuals in canvas.
  move: {
    id: "move",
    archetype: "rocky",
    primaryColor: "#9a4520",
    secondaryColor: "#c96a32",
    accentColor: "#e8c49a",
    bumpScale: 0.32,
    roughness: 0.94,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#f97316",
    ringTilt: 0.15,
    moons: [
      {
        id: "m-move-1",
        name: "Phobos",
        size: 0.22,
        color: "#c4a484",
        distance: 2.2,
        speed: 1.4,
      },
    ],
  },
  // Gas giant with irregular cool atmospheric bands.
  schedule: {
    id: "schedule",
    archetype: "gas_giant",
    primaryColor: "#243a6e",
    secondaryColor: "#4a6fb5",
    accentColor: "#c5d4f0",
    bumpScale: 0.04,
    roughness: 0.85,
    hasRings: true,
    ringStyle: "meridian",
    ringColor: "#8aa8d8",
    ringTilt: 0.35,
    moons: [],
  },
  // Cloudy pale ice-haze world.
  study: {
    id: "study",
    archetype: "ice_giant",
    primaryColor: "#6a8fa8",
    secondaryColor: "#a8c4d4",
    accentColor: "#e8f1f6",
    bumpScale: 0.05,
    roughness: 0.55,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#b6d4e3",
    ringTilt: 0.1,
    moons: [
      {
        id: "m-study-1",
        name: "Mimas",
        size: 0.2,
        color: "#d0dde6",
        distance: 2.1,
        speed: 1.1,
      },
    ],
  },
  // Warm-banded gas giant with irregular storms.
  wallet: {
    id: "wallet",
    archetype: "gas_giant",
    primaryColor: "#5c4a32",
    secondaryColor: "#c4923a",
    accentColor: "#f0dfb0",
    bumpScale: 0.04,
    roughness: 0.7,
    hasRings: true,
    ringStyle: "saturnian",
    ringColor: "#d4b06a",
    ringTilt: 0.45,
    moons: [
      {
        id: "m-wallet-1",
        name: "Titan",
        size: 0.28,
        color: "#c9b896",
        distance: 2.5,
        speed: 0.9,
      },
    ],
  },
  // Volcanic basalt with isolated lava (emissive reserved for fissure color only).
  explore: {
    id: "explore",
    archetype: "volcanic",
    primaryColor: "#3a3548",
    secondaryColor: "#8b3d2f",
    accentColor: "#e8a060",
    bumpScale: 0.28,
    roughness: 0.88,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#a78bfa",
    ringTilt: 0.25,
    moons: [],
  },
  // Pale dusty cloud-world (soft bands, no Earth geography).
  travel: {
    id: "travel",
    archetype: "gas_giant",
    primaryColor: "#8a7e72",
    secondaryColor: "#c4b8a8",
    accentColor: "#f2ebe0",
    bumpScale: 0.03,
    roughness: 0.65,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#d6cfc4",
    ringTilt: 0.15,
    moons: [],
  },
  // Cratered charcoal rocky world.
  career: {
    id: "career",
    archetype: "rocky",
    primaryColor: "#3a3f48",
    secondaryColor: "#6b7280",
    accentColor: "#c5cad3",
    bumpScale: 0.32,
    roughness: 0.98,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#94a3b8",
    ringTilt: 0.2,
    moons: [
      {
        id: "m-career-1",
        name: "Apollo",
        size: 0.24,
        color: "#9aa3ad",
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
