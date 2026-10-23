import { SpecialistId } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";

export interface SolarDawnWaypoint {
  /** Camera focus target for this step. */
  id: SpecialistId;
  title: string;
  subtitle: string;
  content: string;
}

/**
 * Full Solar Dawn fly-through: Orbit Core (sun) then every primary
 * orbiting planet (inner → outer), ending back at Core.
 * Excludes Deals / Build moonlets — they are not independent system bodies.
 */
export const SOLAR_DAWN_WAYPOINTS: SolarDawnWaypoint[] = [
  {
    id: "core",
    title: "Solar Dawn Briefing: Orbit Core",
    subtitle: "Rochester Institute of Technology • Men's Volleyball & AI BS '28",
    content:
      "Good morning. Initializing daily unified briefing across your domains.",
  },
  {
    id: "health",
    title: "Waypoint: Orbit Health",
    subtitle: SPECIALISTS.health.domain,
    content:
      "Breakfast oats and protein logged (~740 kcal). Pre-practice high-protein snack scheduled for 4:45 PM against your 3,100 kcal bulk target.",
  },
  {
    id: "move",
    title: "Waypoint: Orbit Move",
    subtitle: SPECIALISTS.move.domain,
    content:
      "Upper / Lower split on track. Light legs Friday protects match readiness for Men's Volleyball.",
  },
  {
    id: "schedule",
    title: "Waypoint: Orbit Schedule",
    subtitle: SPECIALISTS.schedule.domain,
    content:
      "CSCI 320 at 10 AM, Computer Vision at 2 PM, and Men's Volleyball Practice at 6 PM. No course conflicts.",
  },
  {
    id: "study",
    title: "Waypoint: Orbit Study",
    subtitle: SPECIALISTS.study.domain,
    content:
      "Computer Vision deck staged — residual connections still need review. Evening study hold ready for confirmation.",
  },
  {
    id: "wallet",
    title: "Waypoint: Orbit Wallet",
    subtitle: SPECIALISTS.wallet.domain,
    content:
      "$540.36 buffer remaining under your $800 monthly cap. Soft limit cleared for break travel look-ahead.",
  },
  {
    id: "explore",
    title: "Waypoint: Orbit Explore",
    subtitle: SPECIALISTS.explore.domain,
    content:
      "Scanning Rochester AI meetups and RIT campus weekend events. High-signal shortlist over spam.",
  },
  {
    id: "travel",
    title: "Waypoint: Orbit Travel",
    subtitle: SPECIALISTS.travel.domain,
    content:
      "ROC ↔ BOS break routes watched with wallet and study conflict checks. No auto-booking — suggest and confirm only.",
  },
  {
    id: "career",
    title: "Waypoint: Orbit Career",
    subtitle: SPECIALISTS.career.domain,
    content:
      "Summer 2027 SWE / ML pipeline warm: NVIDIA resume-ready, Nebius staged, Redis submitted.",
  },
  {
    id: "core",
    title: "Solar Dawn Complete",
    subtitle: "Orbit Core Ready for Commands",
    content:
      "All specialists synchronized in Sovereign Memory. Ready for your daily schedule.",
  },
];

/** Camera focus sequence — same length / order as narrations. */
export const SOLAR_DAWN_TOUR_TARGETS: SpecialistId[] = SOLAR_DAWN_WAYPOINTS.map(
  (w) => w.id
);
