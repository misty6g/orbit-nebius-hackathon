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

export const DEFAULT_PLANET_CUSTOMIZATIONS: Record<string, PlanetCustomization> = {
  health: {
    id: "health",
    archetype: "oceanic",
    primaryColor: "#0f3a42",
    secondaryColor: "#10b981",
    accentColor: "#99f6e4",
    bumpScale: 0.15,
    roughness: 0.35,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#34d399",
    ringTilt: 0.2,
    moons: [],
  },
  move: {
    id: "move",
    archetype: "rocky",
    primaryColor: "#7c2d12",
    secondaryColor: "#ea580c",
    accentColor: "#ffedd5",
    bumpScale: 0.35,
    roughness: 0.65,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#f97316",
    ringTilt: 0.15,
    moons: [
      {
        id: "m-move-1",
        name: "Phobos",
        size: 0.22,
        color: "#fdba74",
        distance: 2.2,
        speed: 1.4,
      },
    ],
  },
  schedule: {
    id: "schedule",
    archetype: "gas_giant",
    primaryColor: "#0f224a",
    secondaryColor: "#2563eb",
    accentColor: "#bfdbfe",
    bumpScale: 0.08,
    roughness: 0.3,
    hasRings: true,
    ringStyle: "meridian",
    ringColor: "#60a5fa",
    ringTilt: 0.35,
    moons: [],
  },
  study: {
    id: "study",
    archetype: "ice_giant",
    primaryColor: "#075985",
    secondaryColor: "#38bdf8",
    accentColor: "#e0f2fe",
    bumpScale: 0.05,
    roughness: 0.28,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#7dd3fc",
    ringTilt: 0.1,
    moons: [
      {
        id: "m-study-1",
        name: "Mimas",
        size: 0.2,
        color: "#bae6fd",
        distance: 2.1,
        speed: 1.1,
      },
    ],
  },
  wallet: {
    id: "wallet",
    archetype: "gas_giant",
    primaryColor: "#292524",
    secondaryColor: "#d97706",
    accentColor: "#fef3c7",
    bumpScale: 0.06,
    roughness: 0.32,
    hasRings: true,
    ringStyle: "saturnian",
    ringColor: "#fbbf24",
    ringTilt: 0.45,
    moons: [
      {
        id: "m-wallet-1",
        name: "Titan",
        size: 0.28,
        color: "#fde68a",
        distance: 2.5,
        speed: 0.9,
      },
    ],
  },
  explore: {
    id: "explore",
    archetype: "volcanic",
    primaryColor: "#3b0764",
    secondaryColor: "#9333ea",
    accentColor: "#f3e8ff",
    bumpScale: 0.25,
    roughness: 0.55,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#c084fc",
    ringTilt: 0.25,
    moons: [],
  },
  travel: {
    id: "travel",
    archetype: "gas_giant",
    primaryColor: "#1e3a8a",
    secondaryColor: "#38bdf8",
    accentColor: "#f0f9ff",
    bumpScale: 0.08,
    roughness: 0.32,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#93c5fd",
    ringTilt: 0.15,
    moons: [],
  },
  career: {
    id: "career",
    archetype: "rocky",
    primaryColor: "#0f172a",
    secondaryColor: "#475569",
    accentColor: "#e2e8f0",
    bumpScale: 0.3,
    roughness: 0.5,
    hasRings: false,
    ringStyle: "none",
    ringColor: "#94a3b8",
    ringTilt: 0.2,
    moons: [
      {
        id: "m-career-1",
        name: "Apollo",
        size: 0.24,
        color: "#cbd5e1",
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
