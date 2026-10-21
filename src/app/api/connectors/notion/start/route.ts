import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  isNotionConfigured,
  notionAuthUrl,
  OAUTH_STATE_COOKIE,
} from "@/lib/connectors";

export async function GET() {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error: "NOTION_NOT_CONFIGURED",
        message: "Set NOTION_CLIENT_ID and NOTION_CLIENT_SECRET to enable Notion search.",
      },
      { status: 503 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = notionAuthUrl(state);
  if (!url) {
    return NextResponse.json({ configured: false, error: "NOTION_NOT_CONFIGURED" }, { status: 503 });
  }

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, `notion:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
