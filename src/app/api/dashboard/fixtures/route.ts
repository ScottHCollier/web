import { NextResponse } from "next/server";
import { createMemberFixture } from "@/lib/member-api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.teamId || !body?.title || !body?.startsAt || !body?.venue) {
    return NextResponse.json(
      { detail: "Team, title, date, and venue are required" },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(await createMemberFixture(body), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create fixture";
    const status = message.includes("403") ? 403 : message.includes("404") ? 404 : 502;
    return NextResponse.json(
      { detail: status === 502 ? "Unable to create fixture" : message },
      { status },
    );
  }
}
