import { SpecialistId } from "@/types/orbit";
import {
  DEFAULT_MODEL,
  NEMOTRON_MODELS,
  NEMOTRON_BASE_URLS,
  resolveNebiusModel,
  type NemotronTier,
} from "@/lib/nebius";

export type { NemotronTier };

export const VALID_SPECIALIST_IDS: SpecialistId[] = [
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
];

export const TIER_MAX_TOKENS: Record<NemotronTier, number> = {
  nano: 700,
  super: 1000,
  ultra: 1600,
};

export const TIER_LABELS: Record<NemotronTier, string> = {
  nano: "Nemotron 3 Nano",
  super: "Nemotron 3 Super",
  ultra: "Nemotron 3 Ultra",
};

export interface OrbitRoutingDecision {
  intent: string;
  targetSpecialists: SpecialistId[];
  tier: NemotronTier;
  confidence: number;
  reason: string;
  routedBy: "nano" | "heuristic";
  decisionModel: string;
  modelId: string;
  baseUrl: string;
  maxTokens: number;
}

export interface HeuristicRouteInput {
  message: string;
  specialistId: SpecialistId;
  hasExternalContext?: boolean;
  historyTurns?: number;
}

function looksLikeNemotron3Nano(id: string): boolean {
  return /nemotron-3-nano|NVIDIA-Nemotron-3-Nano/i.test(id);
}

function looksLikeNemotron3Ultra(id: string): boolean {
  return /nemotron-3-ultra|Nemotron-3-Ultra/i.test(id);
}

/** Resolve model ids from env with safe defaults. */
export function resolveTierModels() {
  const nanoDefault = DEFAULT_MODEL;
  const nanoEnv = process.env.NEBIUS_MODEL_NANO?.trim();
  const routerEnv = process.env.NEBIUS_MODEL_ROUTER?.trim();
  // Prefer explicit NANO; honor legacy ROUTER only when it is already a Nemotron 3 Nano id.
  const nano = resolveNebiusModel(
    nanoEnv ||
      (routerEnv && looksLikeNemotron3Nano(routerEnv) ? routerEnv : undefined) ||
      nanoDefault
  );

  const ultraEnv = process.env.NEBIUS_MODEL_ULTRA?.trim();
  const reasoning = process.env.NEBIUS_MODEL_REASONING?.trim();
  // Prefer explicit ULTRA; honor legacy REASONING only when it is already Nemotron 3 Ultra.
  const ultra = resolveNebiusModel(
    ultraEnv ||
      (reasoning && looksLikeNemotron3Ultra(reasoning) ? reasoning : undefined) ||
      NEMOTRON_MODELS.ultra
  );

  return {
    nano,
    super: resolveNebiusModel(process.env.NEBIUS_MODEL_SUPER || NEMOTRON_MODELS.super),
    ultra,
    decision: nano,
  };
}

export function resolveTierEndpoint(tier: NemotronTier): {
  modelId: string;
  baseUrl: string;
  maxTokens: number;
} {
  const models = resolveTierModels();
  const modelId = models[tier];
  const baseUrl =
    tier === "nano"
      ? process.env.NEBIUS_BASE_URL || NEMOTRON_BASE_URLS.nano
      : tier === "super"
        ? process.env.NEBIUS_BASE_URL_SUPER || NEMOTRON_BASE_URLS.super
        : process.env.NEBIUS_BASE_URL_ULTRA || NEMOTRON_BASE_URLS.ultra;

  return { modelId, baseUrl, maxTokens: TIER_MAX_TOKENS[tier] };
}

export function cheaperTier(tier: NemotronTier): NemotronTier | null {
  if (tier === "ultra") return "super";
  if (tier === "super") return "nano";
  return null;
}

export function isValidTier(value: unknown): value is NemotronTier {
  return value === "nano" || value === "super" || value === "ultra";
}

export function isValidSpecialistId(value: unknown): value is SpecialistId {
  return typeof value === "string" && (VALID_SPECIALIST_IDS as string[]).includes(value);
}

/** Keyword planet detection (fail-open fallback for Nano decision). */
export function detectSpecialistTargets(
  message: string,
  specialistId: SpecialistId
): SpecialistId[] {
  const lowerMsg = (message || "").toLowerCase();
  const detectedTargets: SpecialistId[] = [];

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

  if (detectedTargets.length === 0) {
    return [specialistId];
  }
  return Array.from(new Set(detectedTargets));
}

/** Heuristic tier when Nano decision is unavailable. */
export function selectNemotronTierHeuristic({
  message,
  specialistId,
  hasExternalContext = false,
  historyTurns = 0,
}: HeuristicRouteInput): { tier: NemotronTier; reason: string } {
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
    return {
      tier: "nano",
      reason: "short status or simple one-domain lookup",
    };
  }

  return {
    tier: "super",
    reason: "everyday synthesis",
  };
}

export function heuristicRoutingDecision(input: HeuristicRouteInput): OrbitRoutingDecision {
  const targets = detectSpecialistTargets(input.message, input.specialistId);
  const { tier, reason } = selectNemotronTierHeuristic(input);
  const endpoint = resolveTierEndpoint(tier);
  const models = resolveTierModels();
  const lower = (input.message || "").toLowerCase();

  return {
    intent: lower.slice(0, 45) || "general",
    targetSpecialists: targets,
    tier,
    confidence: 0.72,
    reason,
    routedBy: "heuristic",
    decisionModel: models.decision,
    modelId: endpoint.modelId,
    baseUrl: endpoint.baseUrl,
    maxTokens: endpoint.maxTokens,
  };
}

/** Extract first JSON object from model text (handles fences / chatter). */
export function extractJsonObject(raw: string): unknown | null {
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

export function parseOrbitRoutingDecision(
  raw: string,
  fallback: HeuristicRouteInput
): OrbitRoutingDecision {
  const heur = heuristicRoutingDecision(fallback);
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== "object") {
    return heur;
  }

  const obj = parsed as Record<string, unknown>;
  const tier = isValidTier(obj.tier) ? obj.tier : heur.tier;

  let targets: SpecialistId[] = [];
  if (Array.isArray(obj.targetSpecialists)) {
    targets = obj.targetSpecialists.filter(isValidSpecialistId);
  }
  if (targets.length === 0) {
    targets = heur.targetSpecialists;
  }

  // When chatting inside a planet, keep that specialist unless Core listed helpers.
  if (
    fallback.specialistId !== "core" &&
    !targets.includes(fallback.specialistId)
  ) {
    targets = [fallback.specialistId, ...targets];
  }

  const endpoint = resolveTierEndpoint(tier);
  const models = resolveTierModels();
  const confidence =
    typeof obj.confidence === "number" && obj.confidence >= 0 && obj.confidence <= 1
      ? obj.confidence
      : 0.85;

  return {
    intent:
      typeof obj.intent === "string" && obj.intent.trim()
        ? obj.intent.trim().slice(0, 80)
        : heur.intent,
    targetSpecialists: Array.from(new Set(targets)),
    tier,
    confidence,
    reason:
      typeof obj.reason === "string" && obj.reason.trim()
        ? obj.reason.trim().slice(0, 160)
        : heur.reason,
    routedBy: "nano",
    decisionModel: models.decision,
    modelId: endpoint.modelId,
    baseUrl: endpoint.baseUrl,
    maxTokens: endpoint.maxTokens,
  };
}

export function buildOrbitDecisionSystemPrompt(specialistId: SpecialistId, room?: string): string {
  return `You are Orbit Core's routing classifier. Output ONE JSON object and nothing else.

Valid targetSpecialists (copy exactly, never invent names):
${VALID_SPECIALIST_IDS.join(", ")}

Valid tier values (copy exactly): nano | super | ultra
- ultra: cross-domain plans, multi-constraint tradeoffs, strategy, architecture/spec, resume tailoring, quiz/flashcard synthesis, long pasted context
- super: everyday synthesis that still needs a solid answer
- nano: short status, greetings, simple one-domain lookups

Active cockpit specialist: ${specialistId}
${room ? `Active Core room: ${room}` : ""}
If cockpit is not core, always include that specialist id in targetSpecialists.
If constraints span domains (travel + budget + academics), include every relevant planet and set tier to ultra.

Required JSON shape:
{"intent":"short phrase","targetSpecialists":["travel","study","wallet"],"tier":"ultra","confidence":0.9,"reason":"brief why"}`;
}

export function buildOrbitDecisionUserPrompt(message: string, studentBlurb: string): string {
  return `Student: ${studentBlurb}

User message:
${message}`;
}

/** Apply a cheaper-tier fallback after a model-missing error. */
export function withCheaperTierFallback(
  decision: OrbitRoutingDecision
): OrbitRoutingDecision | null {
  const next = cheaperTier(decision.tier);
  if (!next) return null;
  const endpoint = resolveTierEndpoint(next);
  return {
    ...decision,
    tier: next,
    reason: `${decision.reason} (fell back from ${decision.tier} to ${next})`,
    modelId: endpoint.modelId,
    baseUrl: endpoint.baseUrl,
    maxTokens: endpoint.maxTokens,
  };
}

export function isModelMissingError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err || "");
  return /model.?not.?found|does not exist|unknown model|404|not available|invalid model/i.test(
    msg
  );
}
