import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

export async function PATCH(request: Request) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const clubId = await getDashboardClubId();
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/theme`, { method: "PATCH", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(await request.json()) });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch (error) {
    console.error("Theme update failed", error);
    return NextResponse.json({ detail: "The theme service is unavailable" }, { status: 503 });
  }
}
