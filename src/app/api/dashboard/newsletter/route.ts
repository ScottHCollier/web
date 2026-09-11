import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

async function proxy(request: Request) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });

  try {
    const clubId = await getDashboardClubId();
    const endpoint = request.method === "POST" ? "broadcasts" : "settings";
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/newsletter/${endpoint}`, {
      method: request.method === "POST" ? "POST" : request.method,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      ...(request.method === "GET" ? {} : { body: JSON.stringify(await request.json()) }),
      cache: "no-store",
    });
    const payload = response.status === 204 ? null : await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "The newsletter service is unavailable" }, { status: 503 });
  }
}

export async function GET(request: Request) { return proxy(request); }
export async function PATCH(request: Request) { return proxy(request); }
export async function POST(request: Request) { return proxy(request); }
