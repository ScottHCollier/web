import "server-only";

import { cookies, headers } from "next/headers";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";
export const dashboardClubCookie = "final-third-dashboard-club";

export async function getDashboardClubId() {
  const selected = (await cookies()).get(dashboardClubCookie)?.value;
  if (selected) return selected;
  const host = (await headers()).get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "");
  const response = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostname)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Club resolution failed: ${response.status}`);
  return (await response.json() as { club_id: string }).club_id;
}
