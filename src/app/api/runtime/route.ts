import { NextResponse } from "next/server";
import { resolveTierModels, TIER_LABELS } from "@/lib/orbitCoreRouter";
import { NEMOTRON_BASE_URLS } from "@/lib/nebius";
import {
  isGoogleConfigured,
  isNotionConfigured,
  isSlackConfigured,
} from "@/lib/connectors/config";

/**
 * Public capability probe for the demo UI and judges.
 * Never returns secret values — only whether server-side keys are present.
 */
export async function GET() {
  const nebiusConfigured = Boolean(process.env.NEBIUS_API_KEY?.trim());
  const tavilyConfigured = Boolean(process.env.TAVILY_API_KEY?.trim());
  const models = resolveTierModels();
  const baseUrl =
    process.env.NEBIUS_BASE_URL || NEMOTRON_BASE_URLS.nano;

  return NextResponse.json({
    inference: {
      provider: "Nebius Token Factory",
      baseUrl,
      /** Primary everyday / decision model (Nano). */
      model: models.nano,
      models: {
        nano: models.nano,
        super: models.super,
        ultra: models.ultra,
        decision: models.decision,
      },
      labels: TIER_LABELS,
      routing:
        "Orbit Core uses Nano to choose specialist planets and response tier (Nano / Super / Ultra).",
      live: nebiusConfigured,
      requiresJudgeKey: !nebiusConfigured,
    },
    search: {
      provider: "Tavily",
      live: tavilyConfigured,
    },
    connectors: {
      google: isGoogleConfigured(),
      notion: isNotionConfigured(),
      slack: isSlackConfigured(),
      anyConfigured:
        isGoogleConfigured() || isNotionConfigured() || isSlackConfigured(),
    },
    demoMode: {
      // Sovereign Shared Brain always works from local profile / Demo Fill
      sharedBrain: true,
      confirmBeforeWrite: true,
      // Connectors fall back to demo brain when OAuth is not wired
      connectorsUseDemoBrainFallback: !(
        isGoogleConfigured() ||
        isNotionConfigured() ||
        isSlackConfigured()
      ),
    },
  });
}
