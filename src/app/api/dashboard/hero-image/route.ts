import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentClub } from "@/lib/current-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const { club } = await getCurrentClub();
    const body = await request.formData();
    const position = new URL(request.url).searchParams.get("position");
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${club.id}/hero-image${position === null ? "" : `?position=${encodeURIComponent(position)}`}`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body,
    });
    const payload = await response.json().catch(() => ({ detail: "Upload failed" }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "The image service is unavailable" }, { status: 503 });
  }
}
