import { NextRequest, NextResponse } from "next/server";
import {
  clearConnectorSession,
  getConnectorStatus,
  readConnectorSession,
  writeConnectorSession,
  ConnectorProvider,
} from "@/lib/connectors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const provider = body.provider as ConnectorProvider | "all" | undefined;

    if (!provider || provider === "all") {
      clearConnectorSession();
      return NextResponse.json({ ok: true, status: getConnectorStatus() });
    }

    const session = readConnectorSession();
    if (provider === "google") delete session.google;
    if (provider === "notion") delete session.notion;
    if (provider === "slack") delete session.slack;
    writeConnectorSession(session);

    return NextResponse.json({ ok: true, status: getConnectorStatus() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
