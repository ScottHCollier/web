import { NextResponse } from "next/server";
import { removeTeam, updateTeam } from "@/lib/team-admin-api";
export async function PUT(request: Request, { params }: { params: Promise<{ teamId: string }> }) { try { return NextResponse.json(await updateTeam((await params).teamId, await request.json())); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not update team" }, { status: 400 }); } }
export async function DELETE(_: Request, { params }: { params: Promise<{ teamId: string }> }) { try { await removeTeam((await params).teamId); return new NextResponse(null, { status: 204 }); } catch (error) { return NextResponse.json({ detail: error instanceof Error ? error.message : "Could not remove team" }, { status: 400 }); } }
