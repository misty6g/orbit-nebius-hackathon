export interface NebiusMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface NebiusChatOptions {
  apiKey?: string;
  model?: string;
  messages: NebiusMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

const DEFAULT_NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1";
const DEFAULT_MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

export async function createNebiusCompletion({
  apiKey,
  model = DEFAULT_MODEL,
  messages,
  temperature = 0.6,
  maxTokens = 1500,
  stream = false,
}: NebiusChatOptions) {
  const token = apiKey || process.env.NEBIUS_API_KEY;
  const baseUrl = process.env.NEBIUS_BASE_URL || DEFAULT_NEBIUS_BASE_URL;

  if (process.env.MOCK_NEBIUS === "true") {
    throw new Error("MOCK_NEBIUS_ACTIVE: External Nebius API calls are blocked to preserve account credits.");
  }

  if (!token) {
    throw new Error("NEBIUS_API_KEY_MISSING");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
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
