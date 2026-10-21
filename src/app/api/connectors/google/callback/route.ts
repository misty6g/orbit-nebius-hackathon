import { NextRequest, NextResponse } from "next/server";
import {
  CONNECTOR_COOKIE,
  encryptSession,
  exchangeGoogleCode,
  getAppUrl,
  OAUTH_STATE_COOKIE,
  readConnectorSession,
} from "@/lib/connectors";

function verifyState(req: NextRequest, provider: string, state: string): boolean {
  const raw = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!raw || !state) return false;
  const [p, value] = raw.split(":");
  return p === provider && value === state;
}

export async function GET(req: NextRequest) {
  const appUrl = getAppUrl();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "";
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/?connector=google&error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !verifyState(req, "google", state)) {
    return NextResponse.redirect(`${appUrl}/?connector=google&error=invalid_state`);
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const session = readConnectorSession();
    const previousRefresh = session.google?.refreshToken;
    session.google = tokens;
    if (!session.google.refreshToken && previousRefresh) {
      session.google.refreshToken = previousRefresh;
    }

    const response = NextResponse.redirect(`${appUrl}/?connector=google&ok=1`);
    response.cookies.set(CONNECTOR_COOKIE, encryptSession(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(OAUTH_STATE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (err: any) {
    return NextResponse.redirect(
      `${appUrl}/?connector=google&error=${encodeURIComponent(err.message || "oauth_failed")}`
    );
  }
}
