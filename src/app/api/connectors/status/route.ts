import { NextResponse } from "next/server";
import { getConnectorStatus } from "@/lib/connectors";
import { assembleConnectorContext, readConnectorSession } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = getConnectorStatus();
    const session = readConnectorSession();
    let snapshot = null;
    if (status.google.connected || status.notion.connected) {
      snapshot = await assembleConnectorContext(session);
    }
    return NextResponse.json({ status, snapshot });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
