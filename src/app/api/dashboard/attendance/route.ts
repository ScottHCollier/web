import { NextResponse } from "next/server";
import { saveMemberAttendance } from "@/lib/member-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.fixtureId || !body?.playerId || !body?.status) {
    return NextResponse.json({ detail: "Fixture, player, and attendance status are required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await saveMemberAttendance(body));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save attendance";
    const status = message.includes("403") ? 403 : message.includes("404") ? 404 : 502;
    return NextResponse.json({ detail: status === 502 ? "Unable to save attendance" : message }, { status });
  }
}
