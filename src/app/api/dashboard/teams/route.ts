import { NextResponse } from "next/server";
import { createTeam } from "@/lib/team-admin-api";
export async function POST(request: Request) { try { return NextResponse.json(await createTeam(await request.json()), { status: 201 }); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not create team" }, { status: 400 }); } }
