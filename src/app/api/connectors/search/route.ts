import { NextRequest, NextResponse } from "next/server";
import {
  ConnectorSource,
  detectSearchIntent,
  readConnectorSession,
  searchConnectors,
} from "@/lib/connectors";
import { SpecialistId } from "@/types/orbit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query || "").trim();
    const specialistId = (body.specialistId || "core") as SpecialistId;
    let sources = (body.sources || []) as ConnectorSource[];

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    if (!sources.length) {
      const intent = detectSearchIntent(query, specialistId);
      sources = intent.sources;
    }

    if (!sources.length) {
      return NextResponse.json({
        sources: [],
        query,
        citations: [],
        notes: ["No connector sources inferred for this query."],
        formatted: "[Connected source search results]\n- No sources selected.",
      });
    }

    const session = readConnectorSession();
    const result = await searchConnectors({ session, query, sources });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
