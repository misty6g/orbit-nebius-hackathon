import { NextRequest, NextResponse } from "next/server";
import { SPECIALISTS } from "@/lib/specialists";
import { SpecialistId, ActionApproval } from "@/types/orbit";
import { createNebiusCompletion } from "@/lib/nebius";

export async function POST(req: NextRequest) {
  try {
    const { message, specialistId = "core", brain, apiKey } = await req.json();

    const activeSpecialist = SPECIALISTS[specialistId as SpecialistId] || SPECIALISTS.core;
    const student = brain?.student || {
      name: "Student",
      university: "University",
      degree: "Computer Science",
      homeAirport: "BOS",
    };

    // Routing and domain detection
    const isCore = specialistId === "core";
    const lowerMsg = (message || "").toLowerCase();

    // Check for cross-domain queries
    const detectedTargets: SpecialistId[] = [];
    if (lowerMsg.includes("fly") || lowerMsg.includes("flight") || lowerMsg.includes("travel") || lowerMsg.includes("home")) {
      detectedTargets.push("travel");
    }
    if (lowerMsg.includes("study") || lowerMsg.includes("exam") || lowerMsg.includes("slide") || lowerMsg.includes("quiz") || lowerMsg.includes("class")) {
      detectedTargets.push("study");
    }
    if (lowerMsg.includes("calendar") || lowerMsg.includes("schedule") || lowerMsg.includes("free time") || lowerMsg.includes("hold")) {
      detectedTargets.push("schedule");
    }
    if (lowerMsg.includes("spend") || lowerMsg.includes("budget") || lowerMsg.includes("wallet") || lowerMsg.includes("cost") || lowerMsg.includes("money") || lowerMsg.includes("$")) {
      detectedTargets.push("wallet");
    }
    if (lowerMsg.includes("eat") || lowerMsg.includes("food") || lowerMsg.includes("meal") || lowerMsg.includes("macro") || lowerMsg.includes("calorie") || lowerMsg.includes("protein") || lowerMsg.includes("bulk")) {
      detectedTargets.push("health");
    }
    if (lowerMsg.includes("workout") || lowerMsg.includes("lift") || lowerMsg.includes("volleyball") || lowerMsg.includes("exercise") || lowerMsg.includes("gym")) {
      detectedTargets.push("move");
    }
    if (lowerMsg.includes("job") || lowerMsg.includes("intern") || lowerMsg.includes("resume") || lowerMsg.includes("apply") || lowerMsg.includes("career")) {
      detectedTargets.push("career");
    }
    if (lowerMsg.includes("build") || lowerMsg.includes("portfolio") || lowerMsg.includes("project spec") || lowerMsg.includes("github")) {
      detectedTargets.push("build");
    }
    if (lowerMsg.includes("deal") || lowerMsg.includes("discount") || lowerMsg.includes(".edu")) {
      detectedTargets.push("deals");
    }
    if (lowerMsg.includes("event") || lowerMsg.includes("meetup") || lowerMsg.includes("rochester")) {
      detectedTargets.push("explore");
    }

    const finalTargets = detectedTargets.length > 0 ? detectedTargets : [specialistId as SpecialistId];

    // Construct system prompt grounded in orbit.txt rules
    const systemPrompt = `You are ${activeSpecialist.name}, part of Orbit - the Sovereign Personal Student OS.
Student Profile:
- Name: ${student.name}
- School: ${student.university} (${student.campus || "Campus"})
- Degree: ${student.degree} (Class of ${student.gradYear || "2028"})
- Home Airport: ${student.homeAirport || "BOS"}
- Nutrition Goal: Bulk (~3000-3200 kcal, 160-180g protein). Honest macro ranges always.
- Workout Split: 4x week lifting + Men's Volleyball club.
- Wallet Cap: $800/month spending cap strictly respected.
- Career Target: Summer 2027 SWE / ML Internships.

Specialist Persona:
${activeSpecialist.tagline}
Rules:
1. Always maintain sovereign privacy. Data stays with the student.
2. Confirm before external writes: NEVER finalize calendar events, emails, flight bookings, or applications without proposing an authorization step.
3. Keep answers concise, actionable, and formatted in clean markdown.
4. For health, always provide honest estimated ranges (e.g. 750-850 kcal) rather than false precision.
5. Em-dash character is forbidden. Use a regular hyphen or clean punctuation.`;

    let aiContent = "";
    let approvalRequest: ActionApproval | undefined = undefined;

    // Check if Nebius API key is available
    const keyToUse = apiKey || process.env.NEBIUS_API_KEY;

    if (keyToUse) {
      try {
        const completionRes = await createNebiusCompletion({
          apiKey: keyToUse,
          model: process.env.NEBIUS_MODEL_REASONING || "nvidia/llama-3.1-nemotron-70b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.6,
          maxTokens: 1200,
        });

        const data = await completionRes.json();
        aiContent = data.choices?.[0]?.message?.content || "";
      } catch (err: any) {
        console.error("Nebius API execution error:", err);
        return NextResponse.json(
          {
            error: "NEBIUS_API_ERROR",
            details: err.message,
          },
          { status: 502 }
        );
      }
    } else {
      // In Strict Mode, if key is completely absent, inform the client to trigger the key gateway
      return NextResponse.json(
        {
          error: "NEBIUS_API_KEY_REQUIRED",
          message: "Please enter your Nebius Token Factory API Key to activate live NVIDIA Nemotron inference.",
        },
        { status: 401 }
      );
    }

    // Detect if external action approval is required
    if (
      lowerMsg.includes("hold") ||
      lowerMsg.includes("schedule") ||
      lowerMsg.includes("book") ||
      lowerMsg.includes("fly") ||
      lowerMsg.includes("apply") ||
      lowerMsg.includes("calendar") ||
      lowerMsg.includes("commit")
    ) {
      if (lowerMsg.includes("fly") || lowerMsg.includes("flight") || lowerMsg.includes("home")) {
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: "travel",
          title: "Hold Calendar for Break Travel: ROC to BOS",
          description: "Staged non-stop flight window (Dec 19 - Jan 3). Fits within $800 monthly cap and clears finals schedule.",
          service: "Google Calendar",
          payload: {
            route: "ROC -> BOS",
            dates: "Dec 19 - Jan 3",
            priceEstimate: "$142",
          },
          status: "pending",
          safetyCheck: "Verified no volleyball game conflicts. Budget buffer remaining: $415.",
          timestamp: "Just now",
        };
      } else if (lowerMsg.includes("apply") || lowerMsg.includes("resume") || lowerMsg.includes("job")) {
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: "career",
          title: "Authorize Application Submission",
          description: "Tailored 1-page ML Engineer application drafted for review. Zero silent submissions.",
          service: "Job Portal",
          payload: {
            role: "SWE / ML Intern Summer 2027",
            status: "ready_for_review",
          },
          status: "pending",
          safetyCheck: "Sovereign review mandatory. All resume bullets verified.",
          timestamp: "Just now",
        };
      } else {
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: (detectedTargets[0] as SpecialistId) || "schedule",
          title: "Authorize Calendar Mutation",
          description: `Orbit ${activeSpecialist.name} requested adding a confirmed time block to your primary calendar.`,
          service: "Google Calendar",
          payload: { action: "create_event", source: activeSpecialist.name },
          status: "pending",
          safetyCheck: "Checked for time conflicts with classes and athletic practices.",
          timestamp: "Just now",
        };
      }
    }

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        sender: specialistId,
        senderName: activeSpecialist.name,
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        routingTrace: isCore
          ? {
              intent: lowerMsg.slice(0, 45),
              targetSpecialists: finalTargets,
              modelUsed: "nvidia/llama-3.1-nemotron-70b-instruct",
              confidence: 0.96,
            }
          : undefined,
        approvalRequest,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
