import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  googleAuthUrl,
  isGoogleConfigured,
  OAUTH_STATE_COOKIE,
} from "@/lib/connectors";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error: "GOOGLE_NOT_CONFIGURED",
        message:
          "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google Calendar, Gmail, and Drive.",
      },
      { status: 503 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = googleAuthUrl(state);
  if (!url) {
    return NextResponse.json({ configured: false, error: "GOOGLE_NOT_CONFIGURED" }, { status: 503 });
  }

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, `google:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
