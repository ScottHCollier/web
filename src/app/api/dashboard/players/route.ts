import { NextResponse } from "next/server";
import { createOnboardingPlayer } from "@/lib/registration-api";
export async function POST(request: Request) { try { return NextResponse.json(await createOnboardingPlayer(await request.json()), { status: 201 }); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not add player" }, { status: 400 }); } }
