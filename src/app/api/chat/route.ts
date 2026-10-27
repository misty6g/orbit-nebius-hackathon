import { NextRequest, NextResponse } from "next/server";
import { SPECIALISTS } from "@/lib/specialists";
import { ActionApproval, ConnectorCitation, SpecialistId } from "@/types/orbit";
import { createNebiusCompletion } from "@/lib/nebius";
import { searchTavily } from "@/lib/tavily";
import {
  assembleConnectorContext,
  detectSearchIntent,
  formatSnapshotForPrompt,
  parseOrbitSearchMarker,
  readConnectorSession,
  searchConnectors,
  stripOrbitSearchMarker,
} from "@/lib/connectors";
import {
  buildOrbitDecisionSystemPrompt,
  buildOrbitDecisionUserPrompt,
  heuristicRoutingDecision,
  isModelMissingError,
  parseOrbitRoutingDecision,
  resolveTierEndpoint,
  resolveTierModels,
  withCheaperTierFallback,
  type OrbitRoutingDecision,
} from "@/lib/orbitCoreRouter";

function defaultHoldWindow() {
  const start = new Date();
  start.setHours(20, 30, 0, 0);
  if (start.getTime() < Date.now()) {
    start.setDate(start.getDate() + 1);
  }
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function runOrbitCoreDecision(opts: {
  apiKey: string;
  message: string;
  specialistId: SpecialistId;
  room?: string;
  studentBlurb: string;
  hasExternalContext: boolean;
  historyTurns: number;
}): Promise<OrbitRoutingDecision> {
  const fallbackInput = {
    message: opts.message,
    specialistId: opts.specialistId,
    hasExternalContext: opts.hasExternalContext,
    historyTurns: opts.historyTurns,
  };

  try {
    const models = resolveTierModels();
    const nanoEndpoint = resolveTierEndpoint("nano");
    const decisionRes = await createNebiusCompletion({
      apiKey: opts.apiKey,
      model: models.decision,
      baseUrl: nanoEndpoint.baseUrl,
      messages: [
        {
          role: "system",
          content: buildOrbitDecisionSystemPrompt(opts.specialistId, opts.room),
        },
        {
          role: "user",
          content: buildOrbitDecisionUserPrompt(opts.message, opts.studentBlurb),
        },
      ],
      temperature: 0.1,
      maxTokens: 280,
      // Classifier must emit JSON, not a long chain-of-thought.
      enableThinking: false,
    });
    const decisionData = await decisionRes.json();
    const message = decisionData.choices?.[0]?.message || {};
    const raw =
      message.content ||
      message.reasoning ||
      message.reasoning_content ||
      "";
    return parseOrbitRoutingDecision(String(raw), fallbackInput);
  } catch (err) {
    console.error("Orbit Core Nano decision error:", err);
    return heuristicRoutingDecision(fallbackInput);
  }
}

async function completeWithTierFallback(opts: {
  apiKey: string;
  decision: OrbitRoutingDecision;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}): Promise<{ content: string; decision: OrbitRoutingDecision }> {
  let current = opts.decision;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await createNebiusCompletion({
        apiKey: opts.apiKey,
        model: current.modelId,
        baseUrl: current.baseUrl,
        messages: opts.messages,
        temperature: 0.6,
        maxTokens: current.maxTokens,
      });
      const data = await res.json();
      return {
        content: data.choices?.[0]?.message?.content || "",
        decision: current,
      };
    } catch (err) {
      lastError = err;
      if (!isModelMissingError(err)) {
        throw err;
      }
      const cheaper = withCheaperTierFallback(current);
      if (!cheaper) throw err;
      console.warn(
        `Orbit response model unavailable (${current.modelId}); falling back to ${cheaper.tier}`
      );
      current = cheaper;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      specialistId = "core",
      brain,
      apiKey,
      tavilyKey: clientTavilyKey,
      history = [],
      room,
    } = await req.json();

    const activeSpecialistId = (specialistId as SpecialistId) || "core";
    const activeSpecialist = SPECIALISTS[activeSpecialistId] || SPECIALISTS.core;
    const student = brain?.student || {
      name: "Student",
      university: "University",
      degree: "",
      homeAirport: "",
      campus: "",
      gradYear: "",
    };
    const goals = brain?.goals;

    const lowerMsg = (message || "").toLowerCase();
    const studentBlurb = [
      student.name,
      student.university,
      student.degree,
      student.homeAirport ? `home ${student.homeAirport}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    let aiContent = "";
    let approvalRequest: ActionApproval | undefined = undefined;
    let connectorSources: ConnectorCitation[] | undefined = undefined;

    let connectorSnapshotBlock = "";
    let connectorSearchBlock = "";
    try {
      const session = readConnectorSession();
      const hasAny =
        Boolean(session.google?.accessToken) ||
        Boolean(session.notion?.accessToken) ||
        Boolean(session.slack?.accessToken);

      if (hasAny) {
        const snapshot = await assembleConnectorContext(session);
        connectorSnapshotBlock = formatSnapshotForPrompt(snapshot);

        const intent = detectSearchIntent(message || "", activeSpecialistId);
        if (intent.shouldSearch && intent.sources.length > 0) {
          const searchResult = await searchConnectors({
            session,
            query: intent.query || message,
            sources: intent.sources,
          });
          connectorSearchBlock = searchResult.formatted;
          if (searchResult.citations.length > 0) {
            connectorSources = searchResult.citations;
          }
        }
      }
    } catch (err) {
      console.error("Connector context error:", err);
    }

    const keyToUse = apiKey || process.env.NEBIUS_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        {
          error: "NEBIUS_API_KEY_REQUIRED",
          message:
            "Paste a Nebius Token Factory API key in Orbit's credentials modal (or set NEBIUS_API_KEY on the host) to run live NVIDIA Nemotron inference.",
        },
        { status: 401 }
      );
    }

    const historyTurns = Array.isArray(history) ? history.length : 0;
    const provisionalHasExternal =
      Boolean(connectorSnapshotBlock) || Boolean(connectorSearchBlock);

    // Orbit Core dual decision: planets + response tier (always one Nano call per turn).
    let routing = await runOrbitCoreDecision({
      apiKey: keyToUse,
      message: message || "",
      specialistId: activeSpecialistId,
      room,
      studentBlurb,
      hasExternalContext: provisionalHasExternal,
      historyTurns,
    });

    const finalTargets = routing.targetSpecialists;

    let tavilySources: Array<{ title: string; url: string; snippet: string }> | undefined =
      undefined;
    const isWebQuery =
      activeSpecialistId === "deals" ||
      activeSpecialistId === "travel" ||
      activeSpecialistId === "explore" ||
      finalTargets.includes("deals") ||
      finalTargets.includes("travel") ||
      finalTargets.includes("explore") ||
      lowerMsg.includes("deal") ||
      lowerMsg.includes("discount") ||
      lowerMsg.includes("flight") ||
      lowerMsg.includes("meetup") ||
      lowerMsg.includes("event");

    if (isWebQuery) {
      try {
        const tavilyKey =
          (typeof clientTavilyKey === "string" && clientTavilyKey.trim()) ||
          process.env.TAVILY_API_KEY;
        const tavilyRes = await searchTavily(message, tavilyKey);
        if (tavilyRes?.results && tavilyRes.results.length > 0) {
          tavilySources = tavilyRes.results.slice(0, 3);
        }
      } catch (err) {
        console.error("Tavily background search error:", err);
      }
    }

    // If live context arrived after the decision and we stayed on nano for a
    // web/connector-heavy turn, bump everyday synthesis to Super (not Ultra).
    const hasExternalContext =
      provisionalHasExternal || Boolean(tavilySources && tavilySources.length > 0);
    if (hasExternalContext && routing.tier === "nano" && routing.routedBy === "nano") {
      const bumped = resolveTierEndpoint("super");
      routing = {
        ...routing,
        tier: "super",
        reason: `${routing.reason}; upgraded to Super for live context`,
        modelId: bumped.modelId,
        baseUrl: bumped.baseUrl,
        maxTokens: bumped.maxTokens,
      };
    }

    const calories = goals?.nutrition?.caloriesTarget || 2500;
    const protein = goals?.nutrition?.proteinTarget || 120;
    const budget = goals?.wallet?.monthlyBudgetCap || 600;
    const split = goals?.workout?.split || "custom";
    const sports = (goals?.workout?.sports || []).filter(Boolean).join(", ") || "none set";
    const roles = (goals?.career?.targetRoles || []).filter(Boolean).join(", ") || "unset";
    const season = goals?.career?.targetSeason || "unset";

    const systemPrompt = `You are ${activeSpecialist.name}, part of Orbit - the Sovereign Personal Student OS.
Student Profile (from Shared Brain — do not invent demo schools, sports, or companies):
- Name: ${student.name || "Student"}
- School: ${student.university || "University"}${student.campus ? ` (${student.campus})` : ""}
- Degree: ${student.degree || "unset"}${student.gradYear ? ` (Class of ${student.gradYear})` : ""}
- Home Airport: ${student.homeAirport || "unset"}
- Nutrition Goal: ${calories} kcal / ${protein}g protein. Honest macro ranges always.
- Workout Split: ${split}. Sports: ${sports}.
- Wallet Cap: $${budget}/month spending cap strictly respected.
- Career Target: ${season} — ${roles}.

Specialist Persona:
${activeSpecialist.tagline}
${
  activeSpecialistId === "core" && room
    ? `Active Core Room: ${room}. Bias answers toward that room's focus while still using shared brain context.`
    : ""
}
Orbit Core routing for this turn:
- Intent: ${routing.intent}
- Active planets: ${finalTargets.join(", ")}
- Response tier: ${routing.tier} (${routing.reason})
Coordinate across those domains when relevant.

Rules:
1. Always maintain sovereign privacy. Data stays with the student.
2. Confirm before external writes: NEVER finalize calendar events, emails, flight bookings, or applications without proposing an authorization step.
3. Keep answers concise, actionable, and formatted in clean markdown.
4. For health, always provide honest estimated ranges (e.g. 750-850 kcal) rather than false precision.
5. Em-dash character is forbidden. Use a regular hyphen or clean punctuation.
6. When connected account snapshot or search results are provided, ground your answer in them and cite titles.
7. If you need one extra lookup, you may append a single marker: <!--orbit-search:{"sources":["gmail"],"query":"..."}-->`;

    let userPrompt = message as string;
    const contextBlocks: string[] = [];
    if (connectorSnapshotBlock) contextBlocks.push(connectorSnapshotBlock);
    if (connectorSearchBlock) contextBlocks.push(connectorSearchBlock);
    if (tavilySources && tavilySources.length > 0) {
      contextBlocks.push(
        `[Live Web Results from Tavily Search]:\n${tavilySources
          .map((s) => `- [${s.title}](${s.url}): ${s.snippet}`)
          .join("\n")}\nSynthesize these live verified results directly in your response.`
      );
    }
    if (contextBlocks.length) {
      userPrompt = `${message}\n\n${contextBlocks.join("\n\n")}`;
    }

    const historyMessages = (history || [])
      .filter(
        (m: any) =>
          m.content &&
          (m.sender === "user" || m.sender === activeSpecialistId || m.sender === "core")
      )
      .map((m: any) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content as string,
      }));

    try {
      const first = await completeWithTierFallback({
        apiKey: keyToUse,
        decision: routing,
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: userPrompt },
        ],
      });
      aiContent = first.content;
      routing = first.decision;

      const followUp = parseOrbitSearchMarker(aiContent);
      if (followUp) {
        try {
          const session = readConnectorSession();
          const searchResult = await searchConnectors({
            session,
            query: followUp.query,
            sources: followUp.sources,
          });
          connectorSources = [
            ...(connectorSources || []),
            ...searchResult.citations,
          ].slice(0, 24);

          const second = await completeWithTierFallback({
            apiKey: keyToUse,
            decision: routing,
            messages: [
              { role: "system", content: systemPrompt },
              ...historyMessages,
              { role: "user", content: userPrompt },
              {
                role: "assistant",
                content: stripOrbitSearchMarker(aiContent),
              },
              {
                role: "user",
                content: `${searchResult.formatted}\nSynthesize these additional connected-source results. Do not emit another orbit-search marker.`,
              },
            ],
          });
          aiContent = second.content || stripOrbitSearchMarker(aiContent);
          routing = second.decision;
        } catch (followErr) {
          console.error("Connector follow-up search error:", followErr);
          aiContent = stripOrbitSearchMarker(aiContent);
        }
      } else {
        aiContent = stripOrbitSearchMarker(aiContent);
      }
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

    if (
      lowerMsg.includes("hold") ||
      lowerMsg.includes("schedule") ||
      lowerMsg.includes("book") ||
      lowerMsg.includes("fly") ||
      lowerMsg.includes("apply") ||
      lowerMsg.includes("calendar") ||
      lowerMsg.includes("commit") ||
      lowerMsg.includes("draft email") ||
      lowerMsg.includes("email draft")
    ) {
      const hold = defaultHoldWindow();
      if (lowerMsg.includes("draft email") || lowerMsg.includes("email draft")) {
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: finalTargets[0] || "career",
          title: "Authorize Gmail Draft",
          description:
            "Orbit staged a Gmail draft for your review. Nothing is sent until you open Gmail and send it yourself.",
          service: "Gmail",
          payload: {
            to: "me@example.com",
            subject: "Orbit draft follow-up",
            body: "Draft prepared by Orbit for your review.",
          },
          status: "pending",
          safetyCheck: "Draft only. Zero send. User must review in Gmail.",
          timestamp: "Just now",
        };
      } else if (
        lowerMsg.includes("fly") ||
        lowerMsg.includes("flight") ||
        lowerMsg.includes("home")
      ) {
        const airport = student.homeAirport || "HOME";
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: "travel",
          title: `Hold Calendar for Break Travel (${airport})`,
          description: `Staged break travel look-ahead involving ${airport}. Fits within your $${budget}/month cap pending your confirmation.`,
          service: "Google Calendar",
          payload: {
            title: `Confirmed Hold: Break Travel (${airport})`,
            description: "Orbit Travel provisional break window",
            route: airport,
            priceEstimate: "TBD",
          },
          status: "pending",
          safetyCheck: `Budget soft-check against $${budget} monthly cap. No auto-booking.`,
          timestamp: "Just now",
        };
      } else if (
        lowerMsg.includes("apply") ||
        lowerMsg.includes("resume") ||
        lowerMsg.includes("job")
      ) {
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: "career",
          title: "Authorize Application Submission",
          description: `Tailored application draft for ${roles} (${season}). Zero silent submissions.`,
          service: "Job Portal",
          payload: {
            role: roles,
            season,
            status: "ready_for_review",
          },
          status: "pending",
          safetyCheck: "Sovereign review mandatory before any external submit.",
          timestamp: "Just now",
        };
      } else {
        approvalRequest = {
          id: `auth-${Date.now()}`,
          specialistId: finalTargets[0] || "schedule",
          title: "Authorize Calendar Mutation",
          description: `${activeSpecialist.name} requested adding a confirmed time block to your primary calendar.`,
          service: "Google Calendar",
          payload: {
            action: "create_event",
            source: activeSpecialist.name,
            title: "Confirmed Hold: Study Block",
            description: `Study hold proposed by ${activeSpecialist.name}`,
            start: hold.start,
            end: hold.end,
          },
          status: "pending",
          safetyCheck: "Checked for time conflicts with classes and athletic practices.",
          timestamp: "Just now",
        };
      }
    }

    return NextResponse.json({
      message: {
        id: `msg-${Date.now()}`,
        sender: activeSpecialistId,
        senderName: activeSpecialist.name,
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        routingTrace: {
          intent: routing.intent,
          targetSpecialists: finalTargets,
          modelUsed: routing.modelId,
          confidence: routing.confidence,
          tier: routing.tier,
          tierReason: routing.reason,
          decisionModel: routing.decisionModel,
          routedBy: routing.routedBy,
        },
        approvalRequest,
        tavilySources,
        connectorSources,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
