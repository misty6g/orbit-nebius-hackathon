import { NextResponse } from "next/server";
import { MorningBriefData } from "@/types/orbit";
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

export async function GET() {
  const fallback: MorningBriefData = {
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
    greeting: "Good morning, Gyan. Here is your daily Orbit briefing for RIT campus.",
    scheduleHighlights: [
      "10:00 AM - CSCI 320: Principles of Data Mining (Golisano Hall)",
      "02:00 PM - CSCI 431: Computer Vision Lecture",
      "06:00 PM - RIT Men's Volleyball Practice (Clark Gym)",
    ],
    volleyballNotice:
      "Practice tonight at 6:00 PM. High-load leg exercises kept clear of today's workout split.",
    macroPacing:
      "Target: 3,100 kcal / 170g protein. Pace: ~750 kcal breakfast + whey shake logged.",
    budgetStatus: "$540.36 remaining in your $800 monthly cap. On track (Day 21).",
    actionableEmails: [
      "Professor Mohan: CSCI 431 project submission guidelines released.",
      "NVIDIA University Recruiting: Fall technical workshop registration link.",
    ],
    recommendedHolds: [
      "8:30 PM - 10:00 PM: Proposed Study Block for CSCI 320 Paper Review.",
    ],
  };

  try {
    const session = readConnectorSession();
    if (!session.google?.accessToken) {
      return NextResponse.json(fallback);
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

    const volleyball = snapshot.calendar.find((evt) =>
      evt.title.toLowerCase().includes("volleyball")
    );

    const brief: MorningBriefData = {
      ...fallback,
      scheduleHighlights:
        scheduleHighlights.length > 0 ? scheduleHighlights : fallback.scheduleHighlights,
      actionableEmails,
      volleyballNotice: volleyball
        ? `${formatEventLine(volleyball.title, volleyball.start)}. High-load legs kept clear of today's workout split.`
        : fallback.volleyballNotice,
      recommendedHolds: fallback.recommendedHolds,
    };

    return NextResponse.json(brief);
  } catch (err) {
    console.error("Brief connector enrichment failed:", err);
    return NextResponse.json(fallback);
  }
}
