import { PageHeading } from "@/components/page-ui";
import { TeamList } from "@/components/team-list";
import { getPublicClub } from "@/lib/public-club";
import { getAuthenticatedApiUser } from "@/lib/auth";

export const metadata = { title: "Teams" };

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { club, teams } = await getPublicClub();
  const user = await getAuthenticatedApiUser();
  const canEdit = user?.memberships.some((membership) => membership.club_id === club.id && (membership.role === "owner" || membership.role === "admin")) ?? false;
  const { edit } = await searchParams;
  return (
    <>
      <PageHeading
        eyebrow="OUR CLUB"
        title="Our teams"
        description="Every team has a place in our club."
      />
        <TeamList teams={teams} canManage={canEdit && edit === "1"} canDelete={false} showIntegrationStatus={false} />
    </>
  );
}
