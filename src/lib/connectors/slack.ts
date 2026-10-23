import { getRedirectUri, SLACK_USER_SCOPES } from "./config";
import { resolveOAuthApp } from "./session";
import { SlackMessageItem, SlackTokens } from "./types";

const SLACK_AUTH = "https://slack.com/oauth/v2/authorize";
const SLACK_TOKEN = "https://slack.com/api/oauth.v2.access";

export function slackAuthUrl(
  state: string,
  app = resolveOAuthApp("slack")
): string | null {
  if (!app) return null;
  const params = new URLSearchParams({
    client_id: app.clientId,
    user_scope: SLACK_USER_SCOPES,
    redirect_uri: getRedirectUri("slack"),
    state,
  });
  return `${SLACK_AUTH}?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<SlackTokens> {
  const app = resolveOAuthApp("slack");
  if (!app) {
    throw new Error("SLACK_NOT_CONFIGURED");
  }
  const res = await fetch(SLACK_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: app.clientId,
      client_secret: app.clientSecret,
      code,
      redirect_uri: getRedirectUri("slack"),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack token exchange failed: ${text}`);
  }
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error || "unknown"}`);
  }
  const authed = data.authed_user || {};
  return {
    accessToken: authed.access_token || data.access_token,
    teamId: data.team?.id,
    teamName: data.team?.name,
    userId: authed.id,
  };
}

export async function searchSlack(
  tokens: SlackTokens,
  query: string,
  maxResults = 8
): Promise<SlackMessageItem[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    query,
    count: String(maxResults),
    sort: "timestamp",
    sort_dir: "desc",
  });
  const res = await fetch(`https://slack.com/api/search.messages?${params}`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.ok) return [];
  const matches = data.messages?.matches || [];
  return matches.slice(0, maxResults).map((m: any) => ({
    id: m.iid || m.ts || `${m.channel?.id}-${m.ts}`,
    channel: m.channel?.name,
    user: m.username || m.user,
    text: (m.text || "").slice(0, 280),
    permalink: m.permalink,
    timestamp: m.ts,
  }));
}
