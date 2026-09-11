import { PageHeading } from "@/components/page-ui";
import { TeamList } from "@/components/team-list";
import { getMemberApiContext } from "@/lib/member-api";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { canAccessRole } from "@/lib/roles";

export const metadata = { title: "Teams | Dashboard" };

export default async function TeamsPage() {
  const { teams } = await getMemberApiContext();
  const { club } = await getCurrentClub();
  const role = await getCurrentClubRole(club.id);
  return (
    <>
      <PageHeading
        title="Teams"
        description="The teams that make up your club."
      />
      <TeamList canManage={canAccessRole(role, "coach")} canDelete={canAccessRole(role, "admin")}
        teams={teams.map((team) => ({
          id: team.team_id,
          name: team.name,
          description: "Club team",
          externalProvider: team.external_provider ?? null,
          externalId: team.external_id ?? null,
          externalUrl: team.external_url ?? null,
          externalLeagueId: team.external_league_id ?? null,
        }))}
      />
    </>
  );
}
