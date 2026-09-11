import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const clubId = await getDashboardClubId();
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/badge`, { method: "POST", headers: { authorization: `Bearer ${token}` }, body: await request.formData() });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch (error) {
    console.error("Badge upload failed", error);
    return NextResponse.json({ detail: "The image service is unavailable" }, { status: 503 });
  }
}
