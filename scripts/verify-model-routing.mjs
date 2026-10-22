/**
 * Verification for Orbit Core dual routing (planets + Nemotron tier).
 * Mirrors pure helpers in src/lib/orbitCoreRouter.ts — keep in sync when changing rules.
 * Run: npm run verify:models
 */

import assert from "node:assert/strict";

const VALID = new Set([
  "core",
  "health",
  "move",
  "schedule",
  "study",
  "wallet",
  "explore",
  "deals",
  "travel",
  "career",
  "build",
]);

function detectSpecialistTargets(message, specialistId) {
  const lowerMsg = (message || "").toLowerCase();
  const detectedTargets = [];
  if (
    lowerMsg.includes("fly") ||
    lowerMsg.includes("flight") ||
    lowerMsg.includes("travel") ||
    lowerMsg.includes("home")
  ) {
    detectedTargets.push("travel");
  }
  if (
    lowerMsg.includes("study") ||
    lowerMsg.includes("exam") ||
    lowerMsg.includes("slide") ||
    lowerMsg.includes("quiz") ||
    lowerMsg.includes("class") ||
    lowerMsg.includes("fall behind")
  ) {
    detectedTargets.push("study");
  }
  if (
    lowerMsg.includes("calendar") ||
    lowerMsg.includes("schedule") ||
    lowerMsg.includes("free time") ||
    lowerMsg.includes("hold")
  ) {
    detectedTargets.push("schedule");
  }
  if (
    lowerMsg.includes("spend") ||
    lowerMsg.includes("budget") ||
    lowerMsg.includes("wallet") ||
    lowerMsg.includes("cost") ||
    lowerMsg.includes("money") ||
    lowerMsg.includes("$")
  ) {
    detectedTargets.push("wallet");
  }
  if (
    lowerMsg.includes("eat") ||
    lowerMsg.includes("food") ||
    lowerMsg.includes("meal") ||
    lowerMsg.includes("macro") ||
    lowerMsg.includes("calorie") ||
    lowerMsg.includes("protein") ||
    lowerMsg.includes("bulk")
  ) {
    detectedTargets.push("health");
  }
  if (
    lowerMsg.includes("workout") ||
    lowerMsg.includes("lift") ||
    lowerMsg.includes("volleyball") ||
    lowerMsg.includes("exercise") ||
    lowerMsg.includes("gym")
  ) {
    detectedTargets.push("move");
  }
  if (
    lowerMsg.includes("job") ||
    lowerMsg.includes("intern") ||
    lowerMsg.includes("resume") ||
    lowerMsg.includes("apply") ||
    lowerMsg.includes("career")
  ) {
    detectedTargets.push("career");
  }
  if (
    lowerMsg.includes("build") ||
    lowerMsg.includes("portfolio") ||
    lowerMsg.includes("project spec") ||
    lowerMsg.includes("github")
  ) {
    detectedTargets.push("build");
  }
  if (lowerMsg.includes("deal") || lowerMsg.includes("discount") || lowerMsg.includes(".edu")) {
    detectedTargets.push("deals");
  }
  if (lowerMsg.includes("event") || lowerMsg.includes("meetup") || lowerMsg.includes("rochester")) {
    detectedTargets.push("explore");
  }
  if (detectedTargets.length === 0) return [specialistId];
  return [...new Set(detectedTargets)];
}

function selectNemotronTierHeuristic({
  message,
  specialistId,
  hasExternalContext = false,
  historyTurns = 0,
}) {
  const text = message || "";
  const lower = text.toLowerCase();
  const targets = detectSpecialistTargets(text, specialistId);
  const len = text.trim().length;

  const seriousSignals =
    /\b(plan|tradeoff|trade-off|strategy|architect|architecture|spec\b|resume|tailor|quiz|flashcard|multi-constraint|optimize|balance)\b/i.test(
      text
    ) ||
    targets.length >= 2 ||
    ((specialistId === "study" ||
      specialistId === "career" ||
      specialistId === "build" ||
      targets.includes("study") ||
      targets.includes("career") ||
      targets.includes("build")) &&
      len > 180) ||
    len > 600;

  if (seriousSignals) {
    return {
      tier: "ultra",
      reason:
        targets.length >= 2
          ? "cross-domain plan needs Ultra reasoning"
          : "serious synthesis or long context needs Ultra",
    };
  }

  if (hasExternalContext || len > 140 || historyTurns >= 4) {
    return {
      tier: "super",
      reason: hasExternalContext
        ? "everyday synthesis with live context"
        : "non-trivial single-domain question",
    };
  }

  if (
    /\b(hi|hello|hey|thanks|thank you|ok|okay|status|what'?s my|how much)\b/i.test(lower) ||
    len < 80
  ) {
    return { tier: "nano", reason: "short status or simple one-domain lookup" };
  }

  return { tier: "super", reason: "everyday synthesis" };
}

function extractJsonObject(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function parseOrbitRoutingDecision(raw, fallback) {
  const heurTargets = detectSpecialistTargets(fallback.message, fallback.specialistId);
  const heurTier = selectNemotronTierHeuristic(fallback);
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== "object") {
    return {
      targetSpecialists: heurTargets,
      tier: heurTier.tier,
      routedBy: "heuristic",
      reason: heurTier.reason,
    };
  }

  const tier =
    parsed.tier === "nano" || parsed.tier === "super" || parsed.tier === "ultra"
      ? parsed.tier
      : heurTier.tier;

  let targets = Array.isArray(parsed.targetSpecialists)
    ? parsed.targetSpecialists.filter((id) => VALID.has(id))
    : [];
  if (targets.length === 0) targets = heurTargets;
  if (fallback.specialistId !== "core" && !targets.includes(fallback.specialistId)) {
    targets = [fallback.specialistId, ...targets];
  }

  return {
    intent: typeof parsed.intent === "string" ? parsed.intent : "general",
    targetSpecialists: [...new Set(targets)],
    tier,
    routedBy: "nano",
    reason: typeof parsed.reason === "string" ? parsed.reason : heurTier.reason,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
  };
}

// --- Cases ---

const protein = selectNemotronTierHeuristic({
  message: "what's my protein today",
  specialistId: "core",
});
assert.equal(protein.tier, "nano", "protein status should be nano");
assert.deepEqual(detectSpecialistTargets("what's my protein today", "core"), ["health"]);

const deals = selectNemotronTierHeuristic({
  message: "Find current .edu laptop discounts for my major",
  specialistId: "deals",
  hasExternalContext: true,
});
assert.equal(deals.tier, "super", "deals with web context should be super");

const flyHome = selectNemotronTierHeuristic({
  message: "Best time to fly home and not fall behind or overspend",
  specialistId: "core",
});
assert.equal(flyHome.tier, "ultra", "cross-domain fly-home should be ultra");
const flyTargets = detectSpecialistTargets(
  "Best time to fly home and not fall behind or overspend",
  "core"
);
assert.ok(flyTargets.includes("travel"), "fly-home includes travel");
assert.ok(flyTargets.includes("wallet") || flyTargets.includes("study"), "fly-home multi-domain");

const longSpec = selectNemotronTierHeuristic({
  message:
    "Here is a job description for a Summer 2027 ML intern role. Please draft a scoped portfolio project architecture and README starter with tech tradeoffs and a two-week build plan for my RIT AI degree.",
  specialistId: "build",
});
assert.equal(longSpec.tier, "ultra", "pasted project-spec prompt should be ultra");

const parsedOk = parseOrbitRoutingDecision(
  'Sure.\n{"intent":"fly home plan","targetSpecialists":["travel","study","wallet"],"tier":"ultra","confidence":0.91,"reason":"cross-domain"}',
  { message: "fly home", specialistId: "core" }
);
assert.equal(parsedOk.routedBy, "nano");
assert.equal(parsedOk.tier, "ultra");
assert.deepEqual(parsedOk.targetSpecialists, ["travel", "study", "wallet"]);

const fenced = parseOrbitRoutingDecision(
  '```json\n{"intent":"macros","targetSpecialists":["health"],"tier":"nano","confidence":0.8,"reason":"status"}\n```',
  { message: "protein?", specialistId: "health" }
);
assert.equal(fenced.tier, "nano");
assert.equal(fenced.routedBy, "nano");

const badJson = parseOrbitRoutingDecision("not json at all", {
  message: "what's my protein today",
  specialistId: "core",
});
assert.equal(badJson.routedBy, "heuristic");
assert.equal(badJson.tier, "nano");

const cockpitBias = parseOrbitRoutingDecision(
  '{"intent":"lift","targetSpecialists":["schedule"],"tier":"super","confidence":0.7,"reason":"hold"}',
  { message: "schedule a lift", specialistId: "move" }
);
assert.ok(cockpitBias.targetSpecialists.includes("move"), "cockpit specialist kept");

console.log("verify-model-routing: all local cases passed");

// Optional live Token Factory probe (shape only; never fails the script)
if (process.env.NEBIUS_API_KEY?.trim()) {
  const base =
    process.env.NEBIUS_BASE_URL || "https://api.tokenfactory.nebius.com/v1";
  const nanoEnv = process.env.NEBIUS_MODEL_NANO?.trim();
  const routerEnv = process.env.NEBIUS_MODEL_ROUTER?.trim();
  const model =
    nanoEnv ||
    (routerEnv && /nemotron-3-nano|NVIDIA-Nemotron-3-Nano/i.test(routerEnv)
      ? routerEnv
      : null) ||
    "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B";

  try {
    const probe = async (userMessage) => {
      const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEBIUS_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content:
                'Respond with ONLY JSON: {"intent":"...","targetSpecialists":["..."],"tier":"nano|super|ultra","confidence":0.0,"reason":"..."} Valid specialists: core,health,move,schedule,study,wallet,explore,deals,travel,career,build',
            },
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`live decision HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const decision = parseOrbitRoutingDecision(raw, {
        message: userMessage,
        specialistId: "core",
      });
      assert.ok(["nano", "super", "ultra"].includes(decision.tier));
      assert.ok(decision.targetSpecialists.length >= 1);
      return decision;
    };

    const shortLive = await probe("what's my protein today");
    const crossLive = await probe(
      "Best time to fly home and not fall behind or overspend"
    );
    console.log("verify-model-routing: live Nano decisions ok", {
      model,
      short: { tier: shortLive.tier, planets: shortLive.targetSpecialists },
      cross: { tier: crossLive.tier, planets: crossLive.targetSpecialists },
    });
  } catch (err) {
    console.warn(
      "verify-model-routing: live probe skipped after error:",
      err instanceof Error ? err.message : err
    );
  }
} else {
  console.log("verify-model-routing: skipping live probe (NEBIUS_API_KEY unset)");
}
