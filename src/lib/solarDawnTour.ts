import { SharedBrainProfile, SpecialistId } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";

export interface SolarDawnWaypoint {
  /** Camera focus target for this step. */
  id: SpecialistId;
  title: string;
  subtitle: string;
  content: string;
}

/** Camera focus sequence — Core, then primary planets, Core again. */
export const SOLAR_DAWN_TOUR_TARGETS: SpecialistId[] = [
  "core",
  "health",
  "move",
  "schedule",
  "study",
  "wallet",
  "explore",
  "travel",
  "career",
  "core",
];

function sportsLabel(brain: SharedBrainProfile): string {
  const sports = brain.goals.workout.sports?.filter(Boolean) || [];
  if (sports.length === 0) return "your athletics plan";
  if (sports.length === 1) return sports[0];
  return sports.slice(0, 2).join(" & ");
}

function rolesLabel(brain: SharedBrainProfile): string {
  const roles = brain.goals.career.targetRoles?.filter(Boolean) || [];
  if (roles.length === 0) return "your target roles";
  return roles.slice(0, 2).join(" / ");
}

/** Build Solar Dawn narrations from the signed-in Shared Brain (no demo hardcodes). */
export function buildSolarDawnWaypoints(
  brain: SharedBrainProfile
): SolarDawnWaypoint[] {
  const name = brain.student.name?.trim() || "there";
  const university = brain.student.university?.trim() || "your university";
  const degree = brain.student.degree?.trim() || "your degree";
  const grad = brain.student.gradYear?.trim();
  const campus = brain.student.campus?.trim();
  const airport = brain.student.homeAirport?.trim().toUpperCase();
  const split = brain.goals.workout.split?.trim() || "your lifting split";
  const sports = sportsLabel(brain);
  const calories = brain.goals.nutrition.caloriesTarget || 2500;
  const protein = brain.goals.nutrition.proteinTarget || 120;
  const budget = brain.goals.wallet.monthlyBudgetCap || 600;
  const season = brain.goals.career.targetSeason?.trim();
  const roles = rolesLabel(brain);

  const identityBits = [university, degree + (grad ? ` '${grad.slice(-2)}` : "")]
    .filter(Boolean)
    .join(" • ");

  return [
    {
      id: "core",
      title: "Solar Dawn Briefing: Orbit Core",
      subtitle: identityBits || "Sovereign Student OS",
      content: `Good morning, ${name}. Initializing daily unified briefing across your domains.`,
    },
    {
      id: "health",
      title: "Waypoint: Orbit Health",
      subtitle: SPECIALISTS.health.domain,
      content: `Nutrition pacing against your ${calories.toLocaleString()} kcal / ${protein}g protein targets. Log meals with honest ranges — no false precision.`,
    },
    {
      id: "move",
      title: "Waypoint: Orbit Move",
      subtitle: SPECIALISTS.move.domain,
      content:
        sports === "your athletics plan"
          ? `${split} is ready to track. Add sports in your Shared Brain when you want game-day protection.`
          : `${split} on track. Training load respects readiness for ${sports}.`,
    },
    {
      id: "schedule",
      title: "Waypoint: Orbit Schedule",
      subtitle: SPECIALISTS.schedule.domain,
      content: brain.activity.calendar.length
        ? `Today's holds: ${brain.activity.calendar
            .slice(0, 3)
            .map((c) => c.title)
            .join("; ")}. Confirm before any external calendar write.`
        : "Connect Google Calendar or add events to your Shared Brain for a live day map. Confirm before any external write.",
    },
    {
      id: "study",
      title: "Waypoint: Orbit Study",
      subtitle: SPECIALISTS.study.domain,
      content: brain.activity.studyDecks.length
        ? `${brain.activity.studyDecks[0].title} is staged for review. Evening study holds stay confirm-before-write.`
        : "Slide synthesis and spaced flashcards are ready when you add a deck. Study helps you learn — it will not submit graded work.",
    },
    {
      id: "wallet",
      title: "Waypoint: Orbit Wallet",
      subtitle: SPECIALISTS.wallet.domain,
      content: `Monthly soft cap: $${budget.toLocaleString()}. Travel and deals proposals check this budget before you confirm.`,
    },
    {
      id: "explore",
      title: "Waypoint: Orbit Explore",
      subtitle: SPECIALISTS.explore.domain,
      content: campus
        ? `Scanning tech meetups and campus events near ${campus}. High-signal shortlist over spam.`
        : "Scanning local tech meetups and campus events near you. High-signal shortlist over spam.",
    },
    {
      id: "travel",
      title: "Waypoint: Orbit Travel",
      subtitle: SPECIALISTS.travel.domain,
      content: airport
        ? `Break routes involving ${airport} watched with wallet and study conflict checks. No auto-booking — suggest and confirm only.`
        : "Break travel look-ahead with wallet and study conflict checks. Set a home airport in your profile for route focus. No auto-booking.",
    },
    {
      id: "career",
      title: "Waypoint: Orbit Career",
      subtitle: SPECIALISTS.career.domain,
      content: season
        ? `${season} pipeline focus: ${roles}. Resume and application drafts stay confirm-before-send.`
        : `Career focus: ${roles}. Resume and application drafts stay confirm-before-send.`,
    },
    {
      id: "core",
      title: "Solar Dawn Complete",
      subtitle: "Orbit Core Ready for Commands",
      content:
        "All specialists synchronized in Sovereign Memory. Ready for your daily schedule.",
    },
  ];
}

/** @deprecated Prefer buildSolarDawnWaypoints(brain). Static skeleton for camera path only. */
export const SOLAR_DAWN_WAYPOINTS: SolarDawnWaypoint[] = buildSolarDawnWaypoints({
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
    nutrition: { goal: "maintain", caloriesTarget: 2500, proteinTarget: 120 },
    workout: { split: "Custom", frequencyPerWeek: 3, sports: [] },
    wallet: { monthlyBudgetCap: 600, currency: "USD" },
    career: { targetRoles: [], targetSeason: "", skills: [] },
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
});
