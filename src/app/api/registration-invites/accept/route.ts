import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth";

export async function POST(request: Request) { const response = await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/registration-invites/accept`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(await request.json()) }); const body = await response.json().catch(() => null); if (!response.ok) return NextResponse.json(body ?? { detail: "Invite could not be accepted" }, { status: response.status }); const result = NextResponse.json({ user: body.user }); result.cookies.set(authCookieName(), body.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: body.expires_in }); return result; }
