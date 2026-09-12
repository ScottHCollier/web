import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth";
import { dashboardClubCookie } from "@/lib/dashboard-club";

export async function POST() {
  const token = (await cookies()).get(authCookieName())?.value;
  if (token) {
    try {
      await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/auth/logout`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // Clearing the browser cookie still completes local logout if the API is unavailable.
    }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(dashboardClubCookie, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
