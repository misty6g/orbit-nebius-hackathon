import { getAppUrl, isSlackConfigured, SLACK_USER_SCOPES } from "./config";
import { SlackMessageItem, SlackTokens } from "./types";

const SLACK_AUTH = "https://slack.com/oauth/v2/authorize";
const SLACK_TOKEN = "https://slack.com/api/oauth.v2.access";

export function slackAuthUrl(state: string): string | null {
  if (!isSlackConfigured()) return null;
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    user_scope: SLACK_USER_SCOPES,
    redirect_uri: `${getAppUrl()}/api/connectors/slack/callback`,
    state,
  });
  return `${SLACK_AUTH}?${params.toString()}`;
}

export async function exchangeSlackCode(code: string): Promise<SlackTokens> {
  const res = await fetch(SLACK_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${getAppUrl()}/api/connectors/slack/callback`,
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
