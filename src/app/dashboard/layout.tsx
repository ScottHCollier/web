import { ClubProvider } from "@/components/club-provider";
import { ClubShell } from "@/components/club-shell";
import {
  getCurrentClub,
  getCurrentClubRole,
  getCurrentUser,
  getMemberClubs,
} from "@/lib/current-club";
import { cookies } from "next/headers";

export default async function ClubLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { club } = await getCurrentClub();
  const user = await getCurrentUser();
  const role = await getCurrentClubRole(club.id);
  const memberClubs = await getMemberClubs();
  const initialCollapsed =
    (await cookies()).get("final-third-sidebar")?.value === "collapsed";
  return (
    <ClubProvider key={club.id} club={club}>
      <ClubShell
        memberClubs={memberClubs}
        user={user}
        role={role}
        initialCollapsed={initialCollapsed}
      >
        {children}
      </ClubShell>
    </ClubProvider>
  );
}
