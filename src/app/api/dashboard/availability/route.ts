import { NextResponse } from "next/server";
import { saveMemberAvailability } from "@/lib/member-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.fixtureId || !body?.playerId || !body?.status) {
    return NextResponse.json({ detail: "Fixture, player, and status are required" }, { status: 400 });
  }
  try {
    const result = await saveMemberAvailability(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save availability";
    const status = message.includes("403") ? 403 : message.includes("404") ? 404 : 502;
    return NextResponse.json({ detail: status === 502 ? "Unable to save availability" : message }, { status });
  }
}
