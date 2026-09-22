import { NextRequest, NextResponse } from "next/server";
import { searchTavily } from "@/lib/tavily";

export async function POST(req: NextRequest) {
  try {
    const { query, apiKey } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const data = await searchTavily(query, apiKey);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
