import { NextRequest } from "next/server";
import { beginOAuthRedirect, handleOAuthStartPost } from "@/lib/connectors/startOAuth";

export async function GET() {
  return beginOAuthRedirect("notion");
}

export async function POST(req: NextRequest) {
  return handleOAuthStartPost("notion", req);
}
