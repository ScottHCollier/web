import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

async function proxy(request: Request) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const clubId = await getDashboardClubId();
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/articles`, {
      method: request.method,
      headers: { authorization: `Bearer ${token}`, ...(request.method === "POST" ? { "content-type": "application/json" } : {}) },
      ...(request.method === "POST" ? { body: JSON.stringify(await request.json()) } : {}),
    });
    const payload = response.status === 204 ? null : await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "The article service is unavailable" }, { status: 503 });
  }
}

export async function GET(request: Request) { return proxy(request); }
export async function POST(request: Request) { return proxy(request); }
