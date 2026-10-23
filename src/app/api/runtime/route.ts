import { NextResponse } from "next/server";
import { resolveTierModels, TIER_LABELS } from "@/lib/orbitCoreRouter";
import { NEMOTRON_BASE_URLS } from "@/lib/nebius";
import {
  isGoogleConfigured,
  isNotionConfigured,
  isSlackConfigured,
} from "@/lib/connectors/config";

/**
 * Public capability probe for the production UI.
 * Never returns secret values — only whether server-side keys are present.
 * Clients may still supply Nebius / Tavily keys from the in-app credentials modal.
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
      acceptsClientKey: true,
      requiresJudgeKey: !nebiusConfigured,
    },
    search: {
      provider: "Tavily",
      live: tavilyConfigured,
      acceptsClientKey: true,
    },
    credentials: {
      /** Host may ship defaults; empty host still works if the user pastes keys in the UI. */
      serverNebius: nebiusConfigured,
      serverTavily: tavilyConfigured,
      inAppPreferred: true,
    },
    connectors: {
      google: isGoogleConfigured(),
      notion: isNotionConfigured(),
      slack: isSlackConfigured(),
      anyConfigured:
        isGoogleConfigured() || isNotionConfigured() || isSlackConfigured(),
      /** OAuth client ID/secret cannot be fully in-browser; one-time host config. */
      requiresHostOAuth: true,
    },
  });
}
