import Link from "next/link";
import { PageHeading } from "@/components/page-ui";
import { FixtureList } from "@/components/fixture-list";
import { getFixtureImportRuns, getMemberApiContext } from "@/lib/member-api";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { canAccessRole } from "@/lib/roles";
import { dashboardHref } from "@/lib/navigation";
import { SeasonSelect } from "@/components/season-select";
import { FixtureSyncButton } from "@/components/fixture-sync-button";

export const metadata = { title: "Fixtures | Dashboard" };

function seasonFor(date: string) {
  const value = new Date(date);
  const year = value.getUTCFullYear();
  const start = value.getUTCMonth() >= 6 ? year : year - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

function seasonStart(season: string) {
  const year = Number(season.slice(0, 4));
  return Number.isInteger(year) ? year : 0;
}

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>;
}) {
  const { fixtures, teams } = await getMemberApiContext();
  const importRuns = await getFixtureImportRuns();
  const { club } = await getCurrentClub();
  const role = await getCurrentClubRole(club.id);
  const seasons = [...new Set(fixtures.map((fixture) => seasonFor(fixture.starts_at)))].sort(
    (a, b) => seasonStart(b) - seasonStart(a),
  );
  const currentSeason = seasons[0] ?? `${new Date().getUTCFullYear()}-${String(new Date().getUTCFullYear() + 1).slice(-2)}`;
  const requestedSeason = (await searchParams).season;
  const selectedSeason = requestedSeason && seasons.includes(requestedSeason) ? requestedSeason : currentSeason;
  const visibleFixtures = fixtures
    .filter((fixture) => seasonFor(fixture.starts_at) === selectedSeason)
    .sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  return (
    <>
      <PageHeading
        title="Fixtures"
        description="Plan around your club’s upcoming matches and training."
        action={
          <div className="flex items-center gap-2">
            <Link
              href={dashboardHref("availability")}
              className="button-primary rounded-lg px-4 py-2 text-sm"
            >
              Availability
            </Link>
            {canAccessRole(role, "coach") && (
              <>
                <FixtureSyncButton connected={teams.some((team) => team.external_provider === "fa_full_time" && team.external_id)} />
                <Link href={`${dashboardHref("fixtures")}/new`} className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent">Add fixture</Link>
              </>
            )}
          </div>
        }
      />
      <nav className="mb-5 flex items-center gap-3" aria-label="Fixture season filter">
        <SeasonSelect seasons={seasons} selectedSeason={selectedSeason} />
        <span className="ml-auto text-xs text-muted">{visibleFixtures.length} fixtures</span>
      </nav>
      {importRuns[0] && <p className={`mb-5 text-xs ${importRuns[0].status === "failed" ? "text-danger" : "text-muted"}`} role="status">Last Full-Time sync: {importRuns[0].status === "complete" ? `${importRuns[0].created_count} new, ${importRuns[0].updated_count} updated` : importRuns[0].error ?? importRuns[0].status}</p>}
      <FixtureList
        fixtures={visibleFixtures.map((fixture) => ({
          id: fixture.fixture_id,
          title: fixture.title,
          opposition: fixture.opposition,
          isHome: fixture.is_home,
          competition: fixture.competition,
          date: fixture.starts_at,
          venue: fixture.venue,
          team: teams.find((team) => team.team_id === fixture.team_id)?.name ?? "Team",
          homeScore: fixture.home_score,
          awayScore: fixture.away_score,
        }))}
      />
    </>
  );
}
