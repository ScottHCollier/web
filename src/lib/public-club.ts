import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getClubTheme } from "@/lib/club-themes";
import type { ClubData } from "@/types/club";
const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

export const getPublicClubForId = cache(async (clubId: string) => {
  const [clubResponse, teamsResponse, safeguardingResponse, contactResponse] = await Promise.all([
    fetch(`${apiOrigin}/api/v1/public/clubs/${clubId}`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${clubId}/teams`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${clubId}/safeguarding`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${clubId}/contact`, { cache: "no-store" }),
  ]);
  if (!clubResponse.ok || !teamsResponse.ok) notFound();
  const club = await clubResponse.json() as { club_id: string; name: string; slug: string; badge_url: string | null; theme: ClubData["club"]["theme"] | null };
  const teams = await teamsResponse.json() as { team_id: string; name: string; external_name?: string | null }[];
  const safeguarding = safeguardingResponse.ok ? await safeguardingResponse.json() as { contact_name: string | null; contact_email: string | null; contact_phone: string | null } : { contact_name: null, contact_email: null, contact_phone: null };
  const contact = contactResponse.ok ? await contactResponse.json() as { contact_email: string | null; contact_phone: string | null; contact_address: string | null } : { contact_email: null, contact_phone: null, contact_address: null };
  return {
    club: { id: club.club_id, name: club.name, slug: club.slug, badgeUrl: club.badge_url, heroImageUrl: null, heroDisplayMode: "current" as const, theme: club.theme ?? getClubTheme(club.slug), contactEmail: contact.contact_email, contactPhone: contact.contact_phone, contactAddress: contact.contact_address },
    teams: teams.map(team => ({ id: team.team_id, name: team.name, externalName: team.external_name ?? null })),
    safeguarding,
  };
});

export const getPublicClub = cache(async () => {
  const requestHeaders = await headers();
  const scopedSlug = requestHeaders.get("x-final-third-public-club-slug");
  const host = (await headers()).get("host") ?? "";
  const hostname = host.replace(/:\d+$/, "");
  const clubResponse = scopedSlug
    ? await fetch(`${apiOrigin}/api/v1/public/clubs/by-slug/${encodeURIComponent(scopedSlug)}`, { cache: "no-store" })
    : await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostname)}`, { cache: "no-store" });
  if (!clubResponse.ok) notFound();
  const club = await clubResponse.json() as { club_id: string; name: string; slug: string; badge_url: string | null; contact_email: string | null; contact_phone: string | null; contact_address: string | null };
  const [teamResponse, fixtureResponse, heroResponse, leagueResponse, heroSlidesResponse, safeguardingResponse, articlesResponse, contactResponse] = await Promise.all([
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/teams`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/fixtures`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/hero-image`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/league`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/hero-slides`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/safeguarding`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/articles`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/clubs/${club.club_id}/contact`, { cache: "no-store" }),
  ]);
  if (!teamResponse.ok || !fixtureResponse.ok) notFound();
  const teams = await teamResponse.json() as { team_id: string; name: string; description: string; external_name?: string | null }[];
  const fixtures = await fixtureResponse.json() as { fixture_id: string; team_id: string; title: string; opposition: string | null; is_home: boolean | null; competition: string | null; starts_at: string; venue: string; home_score: number | null; away_score: number | null }[];
  const league = leagueResponse.ok ? await leagueResponse.json() as { standing_id: string; team_id: string; position: number; team_name: string; played: number; goal_difference: number; points: number }[] : [];
  const heroSlides = heroSlidesResponse.ok ? await heroSlidesResponse.json() as { position: number; image_id: string | null; image_url: string | null; image_name: string | null; image_position: "top" | "center" | "bottom"; eyebrow: string; title: string; body: string }[] : [];
  const hero = heroResponse.ok ? await heroResponse.json() as { mode: "current" | "image"; hero_url: string } : { mode: "current" as const, hero_url: "" };
  const safeguarding = safeguardingResponse.ok ? await safeguardingResponse.json() as { contact_name: string | null; contact_email: string | null; contact_phone: string | null; documents: { document_id: string; title: string; category: string; download_url: string }[] } : { contact_name: null, contact_email: null, contact_phone: null, documents: [] };
  const contact = contactResponse.ok ? await contactResponse.json() as { contact_email: string | null; contact_phone: string | null; contact_address: string | null; contact_description: string | null; instagram_url: string | null; facebook_url: string | null } : { contact_email: null, contact_phone: null, contact_address: null, contact_description: null, instagram_url: null, facebook_url: null };
  const articles = articlesResponse.ok ? await articlesResponse.json() as { article_id: string; image_id: string | null; image_url: string | null; title: string; body: string; published_at: string }[] : [];
  const news = articles.map((article) => ({ id: article.article_id, title: article.title, body: article.body, imageUrl: article.image_url, publishedAt: article.published_at }));
  return {
    club: { id: club.club_id, name: club.name, slug: club.slug, badgeUrl: club.badge_url, heroImageUrl: hero.hero_url || null, heroDisplayMode: hero.mode, contactEmail: contact.contact_email, contactPhone: contact.contact_phone, contactAddress: contact.contact_address, contactDescription: contact.contact_description, instagramUrl: contact.instagram_url, facebookUrl: contact.facebook_url },
    teams: teams.map(team => ({ id: team.team_id, name: team.name, externalName: team.external_name ?? null, description: team.description || `Grassroots football with ${club.name}.` })),
    fixtures: fixtures.map(fixture => ({ id: fixture.fixture_id, teamId: fixture.team_id, title: fixture.title, opposition: fixture.opposition, isHome: fixture.is_home, competition: fixture.competition, date: fixture.starts_at, venue: fixture.venue, team: teams.find(team => team.team_id === fixture.team_id)?.name ?? "Team", homeScore: fixture.home_score, awayScore: fixture.away_score })),
    leagueStandings: league.map(standing => ({ id: standing.standing_id, teamId: standing.team_id, position: standing.position, teamName: standing.team_name, played: standing.played, goalDifference: standing.goal_difference, points: standing.points })),
    heroSlides: heroSlides.map(slide => ({ position: slide.position, imageId: slide.image_id, imageUrl: slide.image_url, imageName: slide.image_name, imagePosition: slide.image_position, eyebrow: slide.eyebrow, title: slide.title, body: slide.body })),
    news,
    safeguarding,
  };
});
