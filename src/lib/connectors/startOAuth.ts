import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleAuthUrl } from "./google";
import { notionAuthUrl } from "./notion";
import { slackAuthUrl } from "./slack";
import {
  encryptOAuthApps,
  OAUTH_APPS_COOKIE,
  OAUTH_STATE_COOKIE,
  readOAuthApps,
  resolveOAuthApp,
  writeOAuthApps,
  type OAuthAppsStash,
  type ResolvedOAuthApp,
} from "./session";
import type { ConnectorProvider } from "./types";

function authUrlFor(
  provider: ConnectorProvider,
  state: string,
  app: ResolvedOAuthApp
): string | null {
  if (provider === "google") return googleAuthUrl(state, app);
  if (provider === "notion") return notionAuthUrl(state, app);
  return slackAuthUrl(state, app);
}

function notConfiguredResponse(provider: ConnectorProvider) {
  const labels: Record<ConnectorProvider, string> = {
    google: "GOOGLE",
    notion: "NOTION",
    slack: "SLACK",
  };
  const label = labels[provider];
  return NextResponse.json(
    {
      configured: false,
      error: `${label}_NOT_CONFIGURED`,
      message: `Add ${label}_CLIENT_ID / ${label}_CLIENT_SECRET on the host, or POST clientId + clientSecret to this route (Advanced), then Connect redirects to provider auth.`,
    },
    { status: 503 }
  );
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function resolveAppForStart(
  provider: ConnectorProvider,
  advanced?: { clientId?: string; clientSecret?: string } | null
): { app: ResolvedOAuthApp | null; stashPatch: OAuthAppsStash | null } {
  if (advanced?.clientId?.trim() && advanced?.clientSecret?.trim()) {
    const creds = {
      clientId: advanced.clientId.trim(),
      clientSecret: advanced.clientSecret.trim(),
    };
    const stashPatch: OAuthAppsStash = {
      ...readOAuthApps(),
      [provider]: creds,
    };
    writeOAuthApps(stashPatch);
    return { app: { ...creds, source: "cookie" }, stashPatch };
  }
  return { app: resolveOAuthApp(provider), stashPatch: null };
}

function attachStartCookies(
  response: NextResponse,
  provider: ConnectorProvider,
  state: string,
  stashPatch: OAuthAppsStash | null
): void {
  response.cookies.set(OAUTH_STATE_COOKIE, `${provider}:${state}`, cookieOptions(600));
  if (stashPatch) {
    response.cookies.set(
      OAUTH_APPS_COOKIE,
      encryptOAuthApps(stashPatch),
      cookieOptions(60 * 60 * 24 * 90)
    );
  }
}

/**
 * GET happy path: CSRF cookie + 302 to provider authorize URL.
 */
export function beginOAuthRedirect(
  provider: ConnectorProvider,
  advanced?: { clientId?: string; clientSecret?: string } | null
): NextResponse {
  const { app, stashPatch } = resolveAppForStart(provider, advanced);
  if (!app) {
    return notConfiguredResponse(provider);
  }

  const state = randomBytes(16).toString("hex");
  const url = authUrlFor(provider, state, app);
  if (!url) {
    return notConfiguredResponse(provider);
  }

  const response = NextResponse.redirect(url);
  attachStartCookies(response, provider, state, stashPatch);
  return response;
}

/**
 * POST Advanced path: stash clientId/secret in orbit_oauth_apps, return authorize URL
 * as JSON so the browser can navigate after Set-Cookie (fetch cannot follow OAuth 302 cleanly).
 */
export async function handleOAuthStartPost(
  provider: ConnectorProvider,
  req: NextRequest
): Promise<NextResponse> {
  let body: { clientId?: string; clientSecret?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { app, stashPatch } = resolveAppForStart(provider, body);
  if (!app) {
    return notConfiguredResponse(provider);
  }

  const state = randomBytes(16).toString("hex");
  const url = authUrlFor(provider, state, app);
  if (!url) {
    return notConfiguredResponse(provider);
  }

  const response = NextResponse.json({ ok: true, url, provider });
  attachStartCookies(response, provider, state, stashPatch);
  return response;
}
