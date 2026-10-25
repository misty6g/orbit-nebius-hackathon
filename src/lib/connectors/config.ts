import type { ConnectorProvider } from "./types";

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function getRedirectUri(provider: ConnectorProvider): string {
  return `${getAppUrl()}/api/connectors/${provider}/callback`;
}

export interface OAuthAppCredentials {
  clientId: string;
  clientSecret: string;
}

/** Host env credentials only (no cookie). */
export function getHostOAuthApp(
  provider: ConnectorProvider
): OAuthAppCredentials | null {
  const pairs: Record<ConnectorProvider, [string | undefined, string | undefined]> = {
    google: [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET],
    notion: [process.env.NOTION_CLIENT_ID, process.env.NOTION_CLIENT_SECRET],
    slack: [process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET],
  };
  const [id, secret] = pairs[provider];
  const clientId = id?.trim();
  const clientSecret = secret?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isHostOAuthConfigured(provider: ConnectorProvider): boolean {
  return Boolean(getHostOAuthApp(provider));
}

export function getConnectorSecret(): string {
  return (
    process.env.CONNECTOR_SECRET ||
    process.env.NEBIUS_API_KEY ||
    "orbit-dev-connector-secret-change-me"
  );
}

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

export const SLACK_USER_SCOPES = ["search:read", "users:read"].join(",");
