import { PageHeading } from "@/components/page-ui";
import { FixtureList } from "@/components/fixture-list";
import { getPublicClub } from "@/lib/public-club";

export const metadata = { title: "Fixtures" };

export default async function FixturesPage() {
  const { fixtures } = await getPublicClub();
  return (
    <>
      <PageHeading
        eyebrow="ON THE PITCH"
        title="Fixtures"
        description="Upcoming matches and training sessions."
      />
      <FixtureList fixtures={fixtures} />
    </>
  );
}
