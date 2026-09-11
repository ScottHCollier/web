import { NextResponse } from "next/server";
import { createOnboardingTeam } from "@/lib/onboarding-api";

export async function POST(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try { return NextResponse.json(await createOnboardingTeam((await params).clubId, await request.json()), { status: 201 }); }
  catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not create team" }, { status: 400 }); }
}
