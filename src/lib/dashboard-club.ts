import "server-only";

import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";
export const dashboardClubCookie = "final-third-dashboard-club";
export const dashboardClubSlugCookie = "final-third-dashboard-club-slug";

export async function getDashboardClubId() {
  const requestHeaders = await headers();
  const scopedSlug = requestHeaders.get("x-final-third-club-slug");
  const selectedSlug = (await cookies()).get(dashboardClubSlugCookie)?.value;
  const slug = scopedSlug || selectedSlug;
  if (slug) {
    const response = await fetch(`${apiOrigin}/api/v1/public/clubs/by-slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!response.ok) notFound();
    return (await response.json() as { club_id: string }).club_id;
  }
  const selected = (await cookies()).get(dashboardClubCookie)?.value;
  if (selected) return selected;
  const host = (await headers()).get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "");
  const response = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostname)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Club resolution failed: ${response.status}`);
  return (await response.json() as { club_id: string }).club_id;
}
