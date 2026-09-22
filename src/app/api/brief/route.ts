import { NextRequest, NextResponse } from "next/server";
import { MorningBriefData } from "@/types/orbit";

export async function GET(req: NextRequest) {
  const brief: MorningBriefData = {
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
    volleyballNotice: "Practice tonight at 6:00 PM. High-load leg exercises kept clear of today's workout split.",
    macroPacing: "Target: 3,100 kcal / 170g protein. Pace: ~750 kcal breakfast + whey shake logged.",
    budgetStatus: "$540.36 remaining in your $800 monthly cap. On track (Day 21).",
    actionableEmails: [
      "Professor Mohan: CSCI 431 project submission guidelines released.",
      "NVIDIA University Recruiting: Fall technical workshop registration link.",
    ],
    recommendedHolds: [
      "8:30 PM - 10:00 PM: Proposed Study Block for CSCI 320 Paper Review.",
    ],
  };

  return NextResponse.json(brief);
}
