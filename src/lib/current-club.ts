import "server-only";
import { headers } from "next/headers";
import { clubOrigin } from "@/lib/club-host";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getAuthenticatedApiUser, toDashboardUser } from "@/lib/auth";
import { getClubTheme } from "@/lib/club-themes";
import { getMemberApiContext } from "@/lib/member-api";
import type { ClubData, ClubRole } from "@/types/club";
import { dashboardHref } from "@/lib/navigation";

export const getCurrentClub = cache(async () => {
  const user = await getCurrentUser();
  const api = await getMemberApiContext();
  const host = (await headers()).get("host") ?? "";
  const response = await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(host.replace(/:\d+$/, ""))}`, { cache: "no-store" });
  if (!response.ok || !user.memberships.some((membership) => membership.clubId === api.clubId)) notFound();
  const club = await response.json() as { club_id: string; name: string; slug: string; badge_url: string | null; theme: ClubData["club"]["theme"] | null };
  const data: ClubData = {
    club: { id: club.club_id, name: club.name, slug: club.slug, badgeUrl: club.badge_url, heroImageUrl: null, heroDisplayMode: "current", theme: club.theme ?? getClubTheme(club.slug) },
    teams: api.teams.map((team) => ({ id: team.team_id, name: team.name })),
    players: api.players.map((player) => ({ id: player.player_id, clubId: api.clubId, name: `${player.legal_first_name} ${player.legal_last_name}`, team: api.teams.find((team) => team.team_id === player.team_id)?.name ?? "Unassigned", registration: player.registration_status === "complete" ? "Complete" : player.registration_status === "invited" ? "Invited" : "Pending" })),
    fixtures: api.fixtures.map((fixture) => ({ id: fixture.fixture_id, clubId: api.clubId, title: fixture.title, opposition: fixture.opposition, isHome: fixture.is_home, competition: fixture.competition, date: fixture.starts_at, venue: fixture.venue, team: api.teams.find((team) => team.team_id === fixture.team_id)?.name ?? "Team" })),
    posts: [],
    payments: api.payments.map((payment) => ({
      id: payment.payment_id,
      clubId: api.clubId,
      description: `${payment.player_name} — ${payment.description}`,
      amount: payment.amount_pence / 100,
      status: payment.status === "paid" ? "Paid" : payment.status === "cancelled" ? "Cancelled" : "Outstanding",
    })),
    documents: [],
  };
  return data;
});

export const getMemberClubs = cache(async () => {
  const apiUser = await getAuthenticatedApiUser();
  if (!apiUser) redirect("/login?next=/dashboard");
  const host = (await headers()).get("host") ?? "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "localhost";
  return apiUser.memberships.map((membership) => {
    const slug = membership.club_slug;
    const hostname = baseDomain === "localhost" ? `${slug}.localhost` : `${slug}.${baseDomain}`;
    return { id: membership.club_id, name: slug.replaceAll("-", " "), slug, badgeUrl: null, heroImageUrl: null, heroDisplayMode: "current" as const, theme: getClubTheme(slug), href: clubOrigin(hostname, host) + dashboardHref(), role: membership.role };
  });
});

export const getCurrentUser = cache(async () => {
  const user = await getAuthenticatedApiUser();
  if (!user) redirect("/login?next=/dashboard");
  return toDashboardUser(user);
});

export const getCurrentClubRole = cache(async (clubId: string): Promise<ClubRole> => {
  const user = await getCurrentUser();
  return user.memberships.find((membership) => membership.clubId === clubId)?.role ?? "member";
});
