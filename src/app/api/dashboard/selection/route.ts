import { NextResponse } from "next/server";
import { saveMemberSelection } from "@/lib/member-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.fixtureId || !body?.playerId || typeof body.selected !== "boolean") {
    return NextResponse.json({ detail: "Fixture, player, and selection are required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await saveMemberSelection(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save selection";
    const status = message.includes("403") ? 403 : message.includes("404") ? 404 : 502;
    return NextResponse.json({ detail: status === 502 ? "Unable to save selection" : message }, { status });
  }
}
