import { NextRequest, NextResponse } from "next/server";
import {
  createCalendarEvent,
  createGmailDraft,
  getValidGoogleTokens,
  readConnectorSession,
} from "@/lib/connectors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const service = String(body.service || "");
    const payload = body.payload || {};

    const session = readConnectorSession();
    const google = await getValidGoogleTokens(session);
    if (!google) {
      return NextResponse.json(
        { error: "GOOGLE_NOT_CONNECTED", message: "Connect Google before authorizing writes." },
        { status: 401 }
      );
    }

    if (service === "Google Calendar") {
      const title = payload.title || payload.summary || "Orbit hold";
      const start =
        payload.start ||
        payload.startIso ||
        new Date().toISOString();
      const end =
        payload.end ||
        payload.endIso ||
        new Date(Date.now() + 90 * 60 * 1000).toISOString();

      const created = await createCalendarEvent(google, {
        title,
        description: payload.description || body.description,
        start,
        end,
        location: payload.location,
      });

      return NextResponse.json({
        ok: true,
        service,
        result: created,
      });
    }

    if (service === "Gmail") {
      const to = payload.to || payload.recipient;
      const subject = payload.subject || "Orbit draft";
      const draftBody = payload.body || payload.text || "";
      if (!to) {
        return NextResponse.json(
          { error: "MISSING_TO", message: "Gmail draft requires a recipient." },
          { status: 400 }
        );
      }
      const created = await createGmailDraft(google, {
        to,
        subject,
        body: draftBody,
      });
      return NextResponse.json({
        ok: true,
        service,
        result: created,
      });
    }

    return NextResponse.json(
      {
        error: "UNSUPPORTED_SERVICE",
        message: `Writes for ${service || "unknown"} are not enabled. Notion and Slack stay read-only.`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
