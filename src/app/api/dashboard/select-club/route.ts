import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth";
import { dashboardClubCookie, dashboardClubSlugCookie } from "@/lib/dashboard-club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

async function selectClub(request: Request, clubId: string, clubSlug: string | null, nextPath: string) {
  const token = (await cookies()).get(authCookieName())?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  const response = await fetch(`${apiOrigin}/api/v1/auth/me`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.redirect(new URL("/login", request.url));
  const user = await response.json() as { memberships?: { club_id: string }[] };
  if (!user.memberships?.some(membership => membership.club_id === clubId)) return NextResponse.json({ detail: "Club access denied" }, { status: 403 });
  const destination = new URL(clubSlug ? `/clubs/${encodeURIComponent(clubSlug)}/dashboard${nextPath === "/dashboard" ? "" : nextPath.replace(/^\/dashboard/, "")}` : (nextPath.startsWith("/") ? nextPath : "/dashboard"), request.url);
  const result = NextResponse.redirect(destination);
  result.cookies.set(dashboardClubCookie, clubId, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  if (clubSlug) result.cookies.set(dashboardClubSlugCookie, clubSlug, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return result;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clubId = url.searchParams.get("club_id");
  if (!clubId) return NextResponse.json({ detail: "Club is required" }, { status: 400 });
  return selectClub(request, clubId, url.searchParams.get("club_slug"), url.searchParams.get("next") ?? "/dashboard");
}
