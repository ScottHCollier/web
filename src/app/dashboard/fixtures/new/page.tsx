import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/page-ui";
import { FixtureCreateForm } from "@/components/fixture-create-form";
import { getMemberApiContext } from "@/lib/member-api";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { canAccessRole } from "@/lib/roles";
import { dashboardHref } from "@/lib/navigation";

export const metadata = { title: "Add fixture | Dashboard" };

export default async function NewFixturePage() {
  const { teams } = await getMemberApiContext();
  const { club } = await getCurrentClub();
  const role = await getCurrentClubRole(club.id);
  if (!canAccessRole(role, "coach")) notFound();

  return (
    <>
      <PageHeading
        title="Add fixture"
        description="Create a match or training session for one of your teams."
        action={
          <Link href={dashboardHref("fixtures")} className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent">
            Back to fixtures
          </Link>
        }
      />
      <FixtureCreateForm teams={teams} />
    </>
  );
}
