import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentClub } from "@/lib/current-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

export async function PUT(request: Request) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const { club } = await getCurrentClub();
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${club.id}/hero-slides`, { method: "PUT", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(await request.json()) });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "The image service is unavailable" }, { status: 503 });
  }
}
