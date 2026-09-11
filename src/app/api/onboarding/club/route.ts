import { NextResponse } from "next/server";
import { createOnboardingClub } from "@/lib/onboarding-api";

export async function POST(request: Request) {
  try { return NextResponse.json(await createOnboardingClub(await request.json()), { status: 201 }); }
  catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not create club" }, { status: 400 }); }
}
