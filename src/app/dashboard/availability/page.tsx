import { getMemberApiContext } from "@/lib/member-api";
import { PageHeading } from "@/components/page-ui";
import { AvailabilityList } from "@/components/availability-list";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { canAccessRole } from "@/lib/roles";

export default async function Page() {
  const data = await getMemberApiContext();
  const { club } = await getCurrentClub();
  const role = await getCurrentClubRole(club.id);
  return (
    <>
      <PageHeading
        title="Availability"
        description="Get a clear picture before the whistle blows. Try a response below."
      />
      <AvailabilityList
        fixtures={data.fixtures}
        players={data.players}
        teams={data.teams}
        initialAvailability={data.availability}
        initialSelection={data.selection}
        initialAttendance={data.attendance}
        canManage={canAccessRole(role, "coach")}
      />
    </>
  );
}
