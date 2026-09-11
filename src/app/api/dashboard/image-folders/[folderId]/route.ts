import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

async function proxy(request: Request, folderId: string, method: "PATCH" | "DELETE") {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const clubId = await getDashboardClubId();
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/image-folders/${folderId}`, { method, headers: { authorization: `Bearer ${token}`, ...(method === "PATCH" ? { "content-type": "application/json" } : {}) }, ...(method === "PATCH" ? { body: JSON.stringify(await request.json()) } : {}) });
    return response.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(await response.json(), { status: response.status });
  } catch (error) { console.error("Image folder mutation request failed", error); return NextResponse.json({ detail: "The image service is unavailable" }, { status: 503 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ folderId: string }> }) { return proxy(request, (await params).folderId, "PATCH"); }
export async function DELETE(request: Request, { params }: { params: Promise<{ folderId: string }> }) { return proxy(request, (await params).folderId, "DELETE"); }
