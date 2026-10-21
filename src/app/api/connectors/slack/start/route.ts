import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  isSlackConfigured,
  OAUTH_STATE_COOKIE,
  slackAuthUrl,
} from "@/lib/connectors";

export async function GET() {
  if (!isSlackConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error: "SLACK_NOT_CONFIGURED",
        message: "Set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to enable Slack search.",
      },
      { status: 503 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = slackAuthUrl(state);
  if (!url) {
    return NextResponse.json({ configured: false, error: "SLACK_NOT_CONFIGURED" }, { status: 503 });
  }

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, `slack:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
