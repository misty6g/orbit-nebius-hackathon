import { NextResponse } from "next/server";
import { resolveNebiusModel } from "@/lib/nebius";
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
  const model = resolveNebiusModel(process.env.NEBIUS_MODEL_REASONING);
  const baseUrl =
    process.env.NEBIUS_BASE_URL || "https://api.tokenfactory.nebius.com/v1";

  return NextResponse.json({
    inference: {
      provider: "Nebius Token Factory",
      baseUrl,
      model,
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
