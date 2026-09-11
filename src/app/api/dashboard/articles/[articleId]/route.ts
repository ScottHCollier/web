import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

export async function DELETE(request: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const clubId = await getDashboardClubId();
    const { articleId } = await params;
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/articles/${articleId}`, { method: "DELETE", headers: { authorization: `Bearer ${token}` } });
    return response.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "The article service is unavailable" }, { status: 503 });
  }
}
