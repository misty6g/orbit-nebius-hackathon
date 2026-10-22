export interface NebiusMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface NebiusChatOptions {
  apiKey?: string;
  model?: string;
  /** Override Token Factory host (Super/Ultra use us-central1). */
  baseUrl?: string;
  messages: NebiusMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export type NemotronTier = "nano" | "super" | "ultra";

const DEFAULT_NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1";
const US_CENTRAL_BASE_URL = "https://api.tokenfactory.us-central1.nebius.com/v1";

/** Default NVIDIA Nemotron on Token Factory (cost-efficient Nano). */
export const DEFAULT_MODEL = "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B";

export const NEMOTRON_MODELS: Record<NemotronTier, string> = {
  nano: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B",
  super: "nvidia/nemotron-3-super-120b-a12b",
  ultra: "nvidia/Nemotron-3-Ultra-550b-a55b",
};

export const NEMOTRON_BASE_URLS: Record<NemotronTier, string> = {
  nano: DEFAULT_NEBIUS_BASE_URL,
  super: US_CENTRAL_BASE_URL,
  ultra: US_CENTRAL_BASE_URL,
};

/** Reject missing/placeholder model IDs (e.g. misconfigured secrets). */
export function resolveNebiusModel(candidate?: string): string {
  if (!candidate) return DEFAULT_MODEL;
  const trimmed = candidate.trim();
  if (!trimmed.includes("/") || trimmed.includes("[") || trimmed.includes("]")) {
    return DEFAULT_MODEL;
  }
  return trimmed;
}

export async function createNebiusCompletion({
  apiKey,
  model,
  baseUrl: baseUrlOverride,
  messages,
  temperature = 0.6,
  maxTokens = 1500,
  stream = false,
}: NebiusChatOptions) {
  const token = apiKey || process.env.NEBIUS_API_KEY;
  const baseUrl =
    baseUrlOverride || process.env.NEBIUS_BASE_URL || DEFAULT_NEBIUS_BASE_URL;
  const resolvedModel = resolveNebiusModel(
    model || process.env.NEBIUS_MODEL_NANO || process.env.NEBIUS_MODEL_ROUTER || DEFAULT_MODEL
  );

  if (!token) {
    throw new Error("NEBIUS_API_KEY_MISSING");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nebius Token Factory error (${response.status}): ${errorText}`);
  }

  return response;
}
