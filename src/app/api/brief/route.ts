import { NextRequest, NextResponse } from "next/server";
import { MorningBriefData, SharedBrainProfile } from "@/types/orbit";
import {
  assembleConnectorContext,
  readConnectorSession,
} from "@/lib/connectors";

export const dynamic = "force-dynamic";

function formatEventLine(title: string, start: string): string {
  try {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime()) && start.includes("T")) {
      const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return `${time} - ${title}`;
    }
  } catch {
    // fall through
  }
  return `${start} - ${title}`;
}

function buildGenericBrief(brain?: SharedBrainProfile | null): MorningBriefData {
  const name = brain?.student?.name?.trim();
  const campus = brain?.student?.campus?.trim();
  const calories = brain?.goals?.nutrition?.caloriesTarget || 2500;
  const protein = brain?.goals?.nutrition?.proteinTarget || 120;
  const budget = brain?.goals?.wallet?.monthlyBudgetCap || 600;
  const sports = brain?.goals?.workout?.sports?.filter(Boolean) || [];
  const spent =
    brain?.activity?.expenses?.reduce((sum, e) => sum + (e.cost || 0), 0) || 0;
  const remaining = Math.max(0, budget - spent);

  const scheduleFromBrain =
    brain?.activity?.calendar?.slice(0, 6).map((c) => `${c.time} - ${c.title}`) || [];

  return {
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
    greeting: `Good morning${name ? `, ${name}` : ""}. Here is your daily Orbit briefing${
      campus ? ` for ${campus}` : ""
    }.`,
    scheduleHighlights: scheduleFromBrain.length
      ? scheduleFromBrain
      : ["No schedule items yet — connect Google Calendar or add events via chat."],
    athleticsNotice: sports.length
      ? `Sports on profile: ${sports.join(", ")}. Keep high-load training off game days when possible.`
      : undefined,
    volleyballNotice: undefined,
    macroPacing: `Target: ${calories.toLocaleString()} kcal / ${protein}g protein. Log meals with honest ranges.`,
    budgetStatus: `$${remaining.toFixed(2)} remaining under your $${budget.toLocaleString()} monthly cap.`,
    actionableEmails: ["Connect Gmail via Sovereign Connectors to surface priority mail here."],
    recommendedHolds: [
      "Ask Orbit Schedule for a study hold when you want a confirm-before-write block.",
    ],
  };
}

async function resolveBrief(brain?: SharedBrainProfile | null) {
  const fallback = buildGenericBrief(brain);

  try {
    const session = readConnectorSession();
    if (!session.google?.accessToken) {
      return fallback;
    }

    const snapshot = await assembleConnectorContext(session);
    const today = new Date();
    const todayKey = today.toDateString();

    const todayEvents = snapshot.calendar.filter((evt) => {
      const start = new Date(evt.start);
      return !Number.isNaN(start.getTime()) && start.toDateString() === todayKey;
    });

    const scheduleHighlights =
      todayEvents.length > 0
        ? todayEvents.slice(0, 6).map((evt) => formatEventLine(evt.title, evt.start))
        : snapshot.calendar
            .slice(0, 5)
            .map((evt) => formatEventLine(evt.title, evt.start));

    const actionableEmails =
      snapshot.gmail.length > 0
        ? snapshot.gmail
            .slice(0, 4)
            .map((m) => `${m.from.split("<")[0].trim()}: ${m.subject}`)
        : fallback.actionableEmails;

    const sports = brain?.goals?.workout?.sports?.filter(Boolean) || [];
    const sportNeedle = sports.map((s) => s.toLowerCase());
    const athleticsEvent = snapshot.calendar.find((evt) => {
      const title = evt.title.toLowerCase();
      if (sportNeedle.some((s) => title.includes(s.toLowerCase()))) return true;
      return /\b(practice|match|game|training)\b/i.test(evt.title);
    });

    const brief: MorningBriefData = {
      ...fallback,
      scheduleHighlights:
        scheduleHighlights.length > 0 ? scheduleHighlights : fallback.scheduleHighlights,
      actionableEmails,
      athleticsNotice: athleticsEvent
        ? `${formatEventLine(athleticsEvent.title, athleticsEvent.start)}. Keep high-load training mindful of competition readiness.`
        : fallback.athleticsNotice,
      recommendedHolds: fallback.recommendedHolds,
    };

    return brief;
  } catch (err) {
    console.error("Brief connector enrichment failed:", err);
    return fallback;
  }
}

export async function GET() {
  return NextResponse.json(await resolveBrief(null));
}

export async function POST(req: NextRequest) {
  let brain: SharedBrainProfile | null = null;
  try {
    const body = await req.json();
    brain = (body?.brain as SharedBrainProfile) || null;
  } catch {
    /* empty body is fine */
  }
  return NextResponse.json(await resolveBrief(brain));
}
