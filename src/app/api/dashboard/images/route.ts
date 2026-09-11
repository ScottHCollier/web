import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardClubId } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

async function proxy(request: Request, method: "GET" | "POST") {
  const token = (await cookies()).get("final-third-access-token")?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  try {
    const clubId = await getDashboardClubId();
    const sourceUrl = new URL(request.url);
    const folderId = sourceUrl.searchParams.get("folder_id");
    const response = await fetch(`${apiOrigin}/api/v1/clubs/${clubId}/images${folderId ? `?folder_id=${encodeURIComponent(folderId)}` : ""}`, {
      method,
      headers: { authorization: `Bearer ${token}` },
      ...(method === "POST" ? { body: await request.formData() } : {}),
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch (error) {
    console.error("Image library request failed", error);
    return NextResponse.json({ detail: "The image service is unavailable" }, { status: 503 });
  }
}

export async function GET(request: Request) { return proxy(request, "GET"); }
export async function POST(request: Request) { return proxy(request, "POST"); }
