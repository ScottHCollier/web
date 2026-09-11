import { getCurrentClub, getCurrentClubRole, getCurrentUser } from "@/lib/current-club";
import { getMemberApiContext } from "@/lib/member-api";
import { PageHeading } from "@/components/page-ui";
import { PlayerDirectory } from "@/components/player-directory";
import { canAccessRole } from "@/lib/roles";
import Link from "next/link";

export default async function Page() {
  const { club } = await getCurrentClub();
  const user = await getCurrentUser();
  const role = await getCurrentClubRole(club.id);
  const data = await getMemberApiContext();
  return (
    <>
      <PageHeading
        title="Players"
        description="Every player has a place in your club."
        action={canAccessRole(role, "coach") ? <Link href="/dashboard/players/new" className="button-primary rounded-lg px-4 py-2 text-sm">Add player</Link> : undefined}
      />
      <PlayerDirectory
        players={data.players.map((player) => ({
          id: player.player_id,
          clubId: data.clubId,
          name: `${player.legal_first_name} ${player.legal_last_name}`,
          team: data.teams.find((team) => team.team_id === player.team_id)?.name ?? "Unassigned",
          position: player.position,
          dateOfBirth: player.date_of_birth,
          autoRenewNextSeason: player.auto_renew_next_season,
          homegrownPlayer: player.homegrown_player,
          notes: player.notes,
          registration: player.registration_status === "complete" ? "Complete" : player.registration_status === "invited" ? "Invited" : "Pending",
        }))}
        canViewAll={canAccessRole(role, "coach")}
        userEmail={user.email}
      />
    </>
  );
}
