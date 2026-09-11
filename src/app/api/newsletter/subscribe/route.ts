import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { club_id?: string; email?: string } | null;
  if (!body?.email) return NextResponse.json({ detail: "Email is required" }, { status: 400 });
  const host = (await headers()).get("host")?.replace(/:\d+$/, "") ?? "";
  const clubResponse = await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(host)}`, { cache: "no-store" });
  if (!clubResponse.ok) return NextResponse.json({ detail: "Club not found" }, { status: 404 });
  const club = await clubResponse.json() as { club_id: string };
  const response = await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/public/clubs/${club.club_id}/newsletter/subscribe`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: body.email }), cache: "no-store" });
  return NextResponse.json(await response.json().catch(() => ({ detail: "Unable to subscribe" })), { status: response.status });
}
