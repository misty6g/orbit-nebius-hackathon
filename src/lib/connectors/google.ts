import { getRedirectUri, GOOGLE_SCOPES } from "./config";
import { isGoogleConfigured, resolveOAuthApp } from "./session";
import {
  CalendarEventItem,
  ConnectorSession,
  DriveFileItem,
  GmailThreadItem,
  GoogleTokens,
} from "./types";
const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

export function googleAuthUrl(
  state: string,
  app = resolveOAuthApp("google")
): string | null {
  if (!app) return null;
  const params = new URLSearchParams({
    client_id: app.clientId,
    redirect_uri: getRedirectUri("google"),
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
  const app = resolveOAuthApp("google");
  if (!app) {
    throw new Error("GOOGLE_NOT_CONFIGURED");
  }
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: app.clientId,
      client_secret: app.clientSecret,
      redirect_uri: getRedirectUri("google"),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }
  const data = await res.json();
  const tokens: GoogleTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  try {
    const profileRes = await fetch(GOOGLE_USERINFO, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      tokens.email = profile.email;
    }
  } catch {
    // email is optional enrichment
  }

  return tokens;
}

async function refreshGoogleAccess(tokens: GoogleTokens): Promise<GoogleTokens> {
  if (!tokens.refreshToken) return tokens;
  const app = resolveOAuthApp("google");
  if (!app) {
    throw new Error("GOOGLE_NOT_CONFIGURED");
  }
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: app.clientId,
      client_secret: app.clientSecret,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error("Google token refresh failed");
  }
  const data = await res.json();
  return {
    ...tokens,
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    refreshToken: data.refresh_token || tokens.refreshToken,
  };
}

export async function getValidGoogleTokens(
  session: ConnectorSession
): Promise<GoogleTokens | null> {
  if (!session.google?.accessToken) return null;
  let tokens = session.google;
  if (tokens.expiresAt > Date.now() + 60_000) return tokens;
  if (!tokens.refreshToken || !isGoogleConfigured()) return tokens;
  try {
    // Refresh for this request only; persistence happens on next OAuth connect.
    tokens = await refreshGoogleAccess(tokens);
    session.google = tokens;
    return tokens;
  } catch {
    return session.google;
  }
}

async function googleFetch(
  tokens: GoogleTokens,
  url: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
}

export async function listUpcomingEvents(
  tokens: GoogleTokens,
  maxResults = 12
): Promise<CalendarEventItem[]> {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: weekLater.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: String(maxResults),
  });
  const res = await googleFetch(
    tokens,
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.summary || "(untitled)",
    start: item.start?.dateTime || item.start?.date || "",
    end: item.end?.dateTime || item.end?.date || "",
    location: item.location,
    htmlLink: item.htmlLink,
  }));
}

export async function searchCalendarEvents(
  tokens: GoogleTokens,
  query: string,
  maxResults = 8
): Promise<CalendarEventItem[]> {
  const now = new Date();
  const lookback = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lookahead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    q: query,
    timeMin: lookback.toISOString(),
    timeMax: lookahead.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: String(maxResults),
  });
  const res = await googleFetch(
    tokens,
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.summary || "(untitled)",
    start: item.start?.dateTime || item.start?.date || "",
    end: item.end?.dateTime || item.end?.date || "",
    location: item.location,
    htmlLink: item.htmlLink,
  }));
}

export async function listRecentGmail(
  tokens: GoogleTokens,
  maxResults = 8
): Promise<GmailThreadItem[]> {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    q: "in:inbox",
  });
  const listRes = await googleFetch(
    tokens,
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`
  );
  if (!listRes.ok) return [];
  const listData = await listRes.json();
  const messages = listData.messages || [];
  const details = await Promise.all(
    messages.slice(0, maxResults).map(async (m: { id: string }) => {
      const res = await googleFetch(
        tokens,
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const headers = data.payload?.headers || [];
      const get = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
      return {
        id: data.id,
        from: get("From"),
        subject: get("Subject") || "(no subject)",
        date: get("Date"),
        snippet: (data.snippet || "").slice(0, 220),
        permalink: `https://mail.google.com/mail/u/0/#inbox/${data.id}`,
      } as GmailThreadItem;
    })
  );
  return details.filter(Boolean) as GmailThreadItem[];
}

export async function searchGmail(
  tokens: GoogleTokens,
  query: string,
  maxResults = 8
): Promise<GmailThreadItem[]> {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    q: query,
  });
  const listRes = await googleFetch(
    tokens,
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`
  );
  if (!listRes.ok) return [];
  const listData = await listRes.json();
  const messages = listData.messages || [];
  const details = await Promise.all(
    messages.slice(0, maxResults).map(async (m: { id: string }) => {
      const res = await googleFetch(
        tokens,
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const headers = data.payload?.headers || [];
      const get = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
      return {
        id: data.id,
        from: get("From"),
        subject: get("Subject") || "(no subject)",
        date: get("Date"),
        snippet: (data.snippet || "").slice(0, 220),
        permalink: `https://mail.google.com/mail/u/0/#inbox/${data.id}`,
      } as GmailThreadItem;
    })
  );
  return details.filter(Boolean) as GmailThreadItem[];
}

export async function listRecentDrive(
  tokens: GoogleTokens,
  maxResults = 8
): Promise<DriveFileItem[]> {
  const params = new URLSearchParams({
    pageSize: String(maxResults),
    orderBy: "modifiedTime desc",
    fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
    q: "trashed=false",
  });
  const res = await googleFetch(
    tokens,
    `https://www.googleapis.com/drive/v3/files?${params}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
  }));
}

export async function searchDrive(
  tokens: GoogleTokens,
  query: string,
  maxResults = 8
): Promise<DriveFileItem[]> {
  const escaped = query.replace(/'/g, "\\'");
  const params = new URLSearchParams({
    pageSize: String(maxResults),
    fields: "files(id,name,mimeType,modifiedTime,webViewLink)",
    q: `trashed=false and (name contains '${escaped}' or fullText contains '${escaped}')`,
  });
  const res = await googleFetch(
    tokens,
    `https://www.googleapis.com/drive/v3/files?${params}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
  }));
}

export async function createCalendarEvent(
  tokens: GoogleTokens,
  payload: {
    title: string;
    description?: string;
    start: string;
    end: string;
    location?: string;
  }
): Promise<{ id: string; htmlLink?: string }> {
  const body = {
    summary: payload.title,
    description: payload.description,
    location: payload.location,
    start: payload.start.includes("T")
      ? { dateTime: payload.start }
      : { date: payload.start },
    end: payload.end.includes("T")
      ? { dateTime: payload.end }
      : { date: payload.end },
  };
  const res = await googleFetch(
    tokens,
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Calendar create failed: ${text}`);
  }
  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink };
}

function encodeBase64Url(raw: string): string {
  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createGmailDraft(
  tokens: GoogleTokens,
  payload: { to: string; subject: string; body: string }
): Promise<{ id: string }> {
  const mime = [
    `To: ${payload.to}`,
    `Subject: ${payload.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    payload.body,
  ].join("\r\n");
  const res = await googleFetch(
    tokens,
    "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: { raw: encodeBase64Url(mime) },
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail draft failed: ${text}`);
  }
  const data = await res.json();
  return { id: data.id };
}
