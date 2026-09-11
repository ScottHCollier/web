import { NextResponse } from "next/server";
import { updateSafeguardingSettings } from "@/lib/safeguarding-api";
export async function PATCH(request: Request) { try { return NextResponse.json(await updateSafeguardingSettings(await request.json())); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not save safeguarding contact" }, { status: 400 }); } }
