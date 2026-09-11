import type { Metadata } from "next";
import { PageHeading } from "@/components/page-ui";
import { ClubSetupGuide } from "@/components/club-setup-guide";
import { getCurrentClub } from "@/lib/current-club";
import { getPublicClub } from "@/lib/public-club";

export const metadata: Metadata = { title: "Set up your club | Final Third" };

export default async function ClubSetupPage() {
  const { club, teams, safeguarding } = await getPublicClub();
  const current = await getCurrentClub();
  const connectedTeams = teams.filter((team) => team.externalName !== null).length;
  return <><PageHeading eyebrow="WELCOME TO FINAL THIRD" title="Set up your club" description={`A few essentials will get ${club.name} ready for its players, families, and public community.`} /><ClubSetupGuide initial={{ teams: current.teams?.length ?? teams.length, connectedTeams, contactReady: Boolean(club.contactEmail || club.contactPhone || club.contactAddress), safeguardingReady: Boolean(safeguarding.contact_name || safeguarding.contact_email || safeguarding.contact_phone) }} /></>;
}
