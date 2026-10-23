import { getRedirectUri } from "./config";
import { resolveOAuthApp } from "./session";
import { NotionPageItem, NotionTokens } from "./types";

const NOTION_AUTH = "https://api.notion.com/v1/oauth/authorize";
const NOTION_TOKEN = "https://api.notion.com/v1/oauth/token";
const NOTION_VERSION = "2022-06-28";

export function notionAuthUrl(
  state: string,
  app = resolveOAuthApp("notion")
): string | null {
  if (!app) return null;
  const params = new URLSearchParams({
    client_id: app.clientId,
    response_type: "code",
    owner: "user",
    redirect_uri: getRedirectUri("notion"),
    state,
  });
  return `${NOTION_AUTH}?${params.toString()}`;
}

export async function exchangeNotionCode(code: string): Promise<NotionTokens> {
  const app = resolveOAuthApp("notion");
  if (!app) {
    throw new Error("NOTION_NOT_CONFIGURED");
  }
  const basic = Buffer.from(`${app.clientId}:${app.clientSecret}`).toString("base64");
  const res = await fetch(NOTION_TOKEN, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri("notion"),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion token exchange failed: ${text}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    workspaceId: data.workspace_id,
    workspaceName: data.workspace_name,
  };
}

function pageTitle(page: any): string {
  const props = page.properties || {};
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop?.type === "title" && Array.isArray(prop.title)) {
      return prop.title.map((t: any) => t.plain_text || "").join("") || "Untitled";
    }
  }
  if (page.title && Array.isArray(page.title)) {
    return page.title.map((t: any) => t.plain_text || "").join("") || "Untitled";
  }
  return "Untitled";
}

export async function searchNotion(
  tokens: NotionTokens,
  query: string,
  maxResults = 6
): Promise<NotionPageItem[]> {
  const res = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query || undefined,
      page_size: maxResults,
      filter: { property: "object", value: "page" },
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).slice(0, maxResults).map((page: any) => ({
    id: page.id,
    title: pageTitle(page),
    url: page.url,
    lastEdited: page.last_edited_time,
  }));
}

export async function fetchNotionPageExcerpt(
  tokens: NotionTokens,
  pageId: string,
  maxChars = 800
): Promise<string> {
  const res = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children?page_size=20`,
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Notion-Version": NOTION_VERSION,
      },
    }
  );
  if (!res.ok) return "";
  const data = await res.json();
  const parts: string[] = [];
  for (const block of data.results || []) {
    const rich =
      block[block.type]?.rich_text ||
      block[block.type]?.text ||
      block[block.type]?.title;
    if (Array.isArray(rich)) {
      parts.push(rich.map((t: any) => t.plain_text || "").join(""));
    }
    if (parts.join(" ").length >= maxChars) break;
  }
  return parts.join(" ").slice(0, maxChars);
}
