import { SpecialistConfig, SpecialistId, SharedBrainProfile } from "@/types/orbit";

export const SPECIALISTS: Record<SpecialistId, SpecialistConfig> = {
  core: {
    id: "core",
    name: "Orbit Core",
    domain: "Central Orchestrator",
    tagline: "One front door, shared memory, and domain routing.",
    color: "#fbbf24", // Solar Gold
    glowColor: "rgba(251, 191, 36, 0.6)",
    orbitRadius: 0, // Center Sun
    orbitSpeed: 0,
    size: 2.5,
    features: [
      "Nano dual routing: specialist planets + Nano/Super/Ultra response tier",
      "Sovereign external action authorization gates",
      "Solar Dawn morning brief projection",
      "Unified Shared Brain profile access",
    ],
  },
  health: {
    id: "health",
    name: "Orbit Health",
    domain: "Nutrition & Macros",
    tagline: "Honest macro ranges, daily totals, goal pacing.",
    color: "#10b981", // Emerald Gaia
    glowColor: "rgba(16, 185, 129, 0.5)",
    orbitRadius: 6.2,
    orbitSpeed: 0.52,
    size: 0.95,
    features: [
      "Honest macro range estimation (calories & protein)",
      "Daily intake pacing vs your Shared Brain targets",
      "Protein and calorie goal tracking",
      "Water and cadence reminders",
    ],
  },
  move: {
    id: "move",
    name: "Orbit Move",
    domain: "Workouts & Athletics",
    tagline: "Lifting progression, PR tracking, sports coordination.",
    color: "#f97316", // Rust Mars
    glowColor: "rgba(249, 115, 22, 0.5)",
    orbitRadius: 9.8,
    orbitSpeed: 0.42,
    size: 0.9,
    features: [
      "Custom lifting split tracking",
      "Game-day protection for your sports",
      "Muscle group recovery status",
      "PR and progressive overload logs",
    ],
  },
  schedule: {
    id: "schedule",
    name: "Orbit Schedule",
    domain: "Time & Calendar",
    tagline: "Google Calendar connector, free blocks, confirmed holds.",
    color: "#06b6d4", // Chrono Cyan
    glowColor: "rgba(6, 182, 212, 0.5)",
    orbitRadius: 13.8,
    orbitSpeed: 0.35,
    size: 0.95,
    features: [
      "Academic and athletics calendar sync",
      "Free time discovery for study sessions",
      "Strict confirm before creating or deleting events",
      "Inter-specialist schedule holds",
    ],
  },
  study: {
    id: "study",
    name: "Orbit Study",
    domain: "Academics & Learning",
    tagline: "Slide ingest, Nemotron flashcards, quiz engine.",
    color: "#38bdf8", // Sapphire Ice Giant
    glowColor: "rgba(56, 189, 248, 0.5)",
    orbitRadius: 18.2,
    orbitSpeed: 0.29,
    size: 1.15,
    features: [
      "Slide and PDF document synthesis",
      "AI flashcard generation via Nemotron 3 Ultra",
      "Spaced review and weak topic tracking",
      "Helps you learn; will not submit graded work",
    ],
  },
  wallet: {
    id: "wallet",
    name: "Orbit Wallet",
    domain: "Budget & Cashflow",
    tagline: "Monthly spending meter, expense audits, soft limits.",
    color: "#eab308", // Ringed Saturn
    glowColor: "rgba(234, 179, 8, 0.5)",
    orbitRadius: 23.0,
    orbitSpeed: 0.24,
    size: 1.35,
    features: [
      "Monthly spending cap pacing from your Shared Brain",
      "Chat purchase logging and receipt analysis",
      "Soft budget context for Travel and Deals",
      "Sovereign privacy: zero external bank API sync",
    ],
  },
  deals: {
    id: "deals",
    name: "Orbit Deals",
    domain: "Student Discounts",
    tagline: "Curated .edu offers and tech hardware discounts.",
    color: "#34d399", // Emerald Moonlet
    glowColor: "rgba(52, 211, 153, 0.5)",
    orbitRadius: 2.8,
    orbitSpeed: 0.24,
    size: 0.65,
    features: [
      "On-demand .edu discount hunts",
      "Live web discovery via Tavily search",
      "Zero auto-purchase; user reviews every link",
      "Hardware and software student perks",
    ],
  },
  explore: {
    id: "explore",
    name: "Orbit Explore",
    domain: "Campus & Local Events",
    tagline: "Local scene, tech meetups, campus events near you.",
    color: "#a855f7", // Amethyst Aurora
    glowColor: "rgba(168, 85, 247, 0.5)",
    orbitRadius: 28.2,
    orbitSpeed: 0.19,
    size: 1.05,
    features: [
      "Campus and city shortlists from your profile",
      "Tech meetups and student events",
      "Filtered signal over spam",
      "One-click calendar RSVP hold proposal",
    ],
  },
  travel: {
    id: "travel",
    name: "Orbit Travel",
    domain: "Break Flights & Logistics",
    tagline: "Break flight hunter with academic look-ahead.",
    color: "#0ea5e9", // Oceanic Atmosphere
    glowColor: "rgba(14, 165, 233, 0.5)",
    orbitRadius: 33.6,
    orbitSpeed: 0.16,
    size: 0.95,
    features: [
      "Home-airport focused route monitoring",
      "Look-ahead before university breaks",
      "Wallet and study conflict cross-check",
      "Zero auto-booking; strictly suggest and confirm",
    ],
  },
  career: {
    id: "career",
    name: "Orbit Career",
    domain: "Internships & Story",
    tagline: "Internship hunt, resume tailoring, application strategy.",
    color: "#818cf8", // Cyber Carbon
    glowColor: "rgba(129, 140, 248, 0.5)",
    orbitRadius: 39.2,
    orbitSpeed: 0.13,
    size: 1.15,
    features: [
      "Pipeline tracking for your target roles",
      "Resume tailoring from your Shared Brain",
      "Application draft assist with explicit confirmation",
      "Hands proof-of-work project specs to Orbit Build",
    ],
  },
  build: {
    id: "build",
    name: "Orbit Build",
    domain: "Portfolio Projects",
    tagline: "JD to scoped technical spec, architecture, and starter code.",
    color: "#6366f1", // Cyber Moonlet
    glowColor: "rgba(99, 102, 241, 0.5)",
    orbitRadius: 2.8,
    orbitSpeed: 0.12,
    size: 0.65,
    features: [
      "Job description to scoped portfolio project generator",
      "Architecture specs, starter code, and README creation",
      "GitHub repo creation only after explicit approval",
      "Demo script generation for recruiter reviews",
    ],
  },
};

/** Empty Shared Brain shell used only as pre-auth / pre-onboarding placeholder. */
export const DEFAULT_STUDENT_BRAIN: SharedBrainProfile = {
  student: {
    name: "",
    university: "",
    degree: "",
    gradYear: "",
    campus: "",
    homeAirport: "",
    primaryCalendar: "Primary Calendar",
  },
  goals: {
    nutrition: {
      goal: "maintain",
      caloriesTarget: 2500,
      proteinTarget: 120,
    },
    workout: {
      split: "",
      frequencyPerWeek: 3,
      sports: [],
    },
    wallet: {
      monthlyBudgetCap: 600,
      currency: "USD",
    },
    career: {
      targetRoles: [],
      targetSeason: "",
      skills: [],
    },
  },
  activity: {
    meals: [],
    workouts: [],
    calendar: [],
    expenses: [],
    studyDecks: [],
    careerPipeline: [],
  },
  pendingApprovals: [],
};

/** @deprecated Use DEFAULT_STUDENT_BRAIN — kept as an alias for older imports. */
export const INITIAL_DEMO_BRAIN = DEFAULT_STUDENT_BRAIN;
