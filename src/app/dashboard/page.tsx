import Link from "next/link";
import { getCurrentClub } from "@/lib/current-club";
import { PageHeading, formatDate } from "@/components/page-ui";
import { Icon } from "@/components/icon";
import type { Metadata } from "next";
import { dashboardHref } from "@/lib/navigation";
import { ClubSetupGuide } from "@/components/club-setup-guide";
import { getPublicClubForId } from "@/lib/public-club";
import { getCurrentClubRole } from "@/lib/current-club";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const { club } = await getCurrentClub();

  return {
    title: `${club.name}`,
  };
}

export default async function ClubHome() {
  const { club, teams, players, fixtures, payments, documents } =
    await getCurrentClub();
  const requestHeaders = await headers();
  if (!requestHeaders.get("x-final-third-club-slug")) {
    redirect(`/${encodeURIComponent(club.slug)}/dashboard`);
  }
  const { club: publicClub, teams: publicTeams, safeguarding } = await getPublicClubForId(club.id);
  const role = await getCurrentClubRole(club.id);
  const pending = players.filter(
    (player) => player.registration !== "Complete",
  ).length;
  const outstanding = payments
    .filter((payment) => payment.status === "Outstanding")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const now = new Date().getTime();
  const upcomingFixtures = fixtures
    .filter((fixture) => new Date(fixture.date).getTime() > now)
    .sort(
      (first, second) =>
        new Date(first.date).getTime() - new Date(second.date).getTime(),
    )
    .slice(0, 3);
  const href = dashboardHref;
  return (
    <>
      <PageHeading
        eyebrow="YOUR CLUB, AT A GLANCE"
        title="A little more time for football."
        description={`Welcome to your ${club.name} clubhouse.`}
      />
      {(role === "owner" || role === "admin") ? <ClubSetupGuide initial={{ teams: teams?.length ?? 0, connectedTeams: publicTeams.filter((team) => team.externalName).length, contactReady: Boolean(publicClub.contactEmail || publicClub.contactPhone || publicClub.contactAddress), safeguardingReady: Boolean(safeguarding.contact_name || safeguarding.contact_email || safeguarding.contact_phone) }} /> : null}
      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-1">
        <div className="min-w-0 col-span-2 max-xl:col-span-1">
          <section className="relative min-h-72 overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
            <div className="relative z-10">
              <p className="mb-2 text-xs font-medium tracking-widest text-primary-foreground">
                ONE CLUB. EVERYONE COUNTS.
              </p>
              <h2 className="text-3xl font-medium leading-tight tracking-tight">
                Less admin.
                <br />
                More beautiful game.
              </h2>
              <p className="mt-4 text-sm leading-loose">
                Your players, your people, your next matchday.
                <br />
                Keep it all moving from one place.
              </p>
              <Link
                className="button-primary mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs font-medium"
                href={href("availability")}
              >
                Plan the week <Icon name="arrow" />
              </Link>
            </div>
            <div className="pitch" aria-hidden="true">
              <div className="pitch-line" />
              <div className="pitch-circle" />
              <div className="goal left" />
              <div className="goal right" />
              <div className="pitch-dot one" />
              <div className="pitch-dot two" />
              <div className="pitch-dot three" />
            </div>
          </section>
          <div className="mt-4 grid grid-cols-4 gap-3 max-md:grid-cols-2">
            {[
              ["Club players", players.length, "players"],
              [
                "Teams",
                teams?.length ?? new Set(players.map((player) => player.team)).size,
                "teams",
              ],
              ["To register", pending, "registrations"],
              ["Outstanding", `£${outstanding.toFixed(2)}`, "payments"],
            ].map(([label, value, route]) => (
              <Link
                key={label}
                className="panel relative p-5 transition-shadow hover:shadow-md hover:shadow-shadow/15"
                href={href(String(route))}
              >
                <span className="block text-xs text-muted">{label}</span>
                <strong className="mt-2 block text-xl font-medium tracking-tight">
                  {value}
                </strong>
                <Icon name="arrow" className="absolute bottom-5 right-5" />
              </Link>
            ))}
          </div>
        </div>
        <aside
          className="grid content-start gap-4"
          aria-label="Club essentials"
        >
          <section className="panel">
            <div className="flex items-center justify-between gap-3 border-b border-line p-5">
              <h2 className="text-base font-medium tracking-tight">
                Coming up
              </h2>
              <Icon name="calendar" />
            </div>
            {upcomingFixtures.length ? upcomingFixtures.map((fixture) => (
              <Link
                className="flex gap-3 border-b border-line p-4 last:border-0 hover:bg-surface-muted "
                href={href("availability")}
                key={fixture.id}
              >
                <div className="grid h-14 w-12 flex-shrink-0 place-items-center rounded-lg bg-accent-soft py-1 text-xs uppercase text-accent">
                  {new Intl.DateTimeFormat("en-GB", {
                    month: "short",
                    timeZone: "Europe/London",
                  }).format(new Date(fixture.date))}
                  <strong className="text-xl font-medium">
                    {new Date(fixture.date).getUTCDate()}
                  </strong>
                </div>
                <div>
                  <span className="text-xs font-medium tracking-widest text-muted">
                    {fixture.team}
                  </span>
                  <h3 className="mt-1 text-sm font-medium">{fixture.title}</h3>
                  <p className="mt-1 text-xs text-muted ">
                    {formatDate(fixture.date)}
                  </p>
                </div>
              </Link>
            )) : <p className="p-5 text-sm text-muted">No upcoming fixtures. Add one or sync your FA Full-Time team.</p>}
          </section>
          <section className="panel">
            <div className="flex items-center justify-between gap-3 border-b border-line p-5">
              <h2 className="text-base font-medium tracking-tight">
                Club documents
              </h2>
              <Link href={href("documents")} aria-label="View club documents">
                <Icon name="arrow" />
              </Link>
            </div>
            {documents.length ? documents.map((document) => (
              <Link
                className="flex items-center gap-3 border-b border-line p-4 text-xs last:border-0 hover:bg-surface-muted "
                href={href("documents")}
                key={document.id}
              >
                <Icon name="document" />
                <span className="min-w-0 flex-1">{document.title}</span>
                <Icon name="chevron" className="ml-auto" />
              </Link>
            )) : <p className="p-5 text-sm text-muted">Your club documents will appear here.</p>}
          </section>
          <section className="panel">
            <div className="flex items-center justify-between gap-3 border-b border-line p-5">
              <h2 className="text-base font-medium tracking-tight">
                A little follow-up
              </h2>
              <Icon name="sparkles" />
            </div>
            <Link
              className="flex items-center gap-3 border-b border-line p-4 last:border-0 hover:bg-surface-muted "
              href={href("registrations")}
            >
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon name="document" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium">Ready for the season</h3>
                <p className="mt-1 text-xs text-muted ">
                  {pending} registrations to complete
                </p>
              </div>
              <Icon name="chevron" className="ml-auto" />
            </Link>
            <Link
              className="flex items-center gap-3 border-b border-line p-4 last:border-0 hover:bg-surface-muted "
              href={href("payments")}
            >
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-warning text-warning-foreground">
                <Icon name="wallet" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium">Keep things moving</h3>
                <p className="mt-1 text-xs text-muted ">
                  £{outstanding.toFixed(2)} in outstanding fees
                </p>
              </div>
              <Icon name="chevron" className="ml-auto" />
            </Link>
          </section>
          <div className="flex items-center justify-center gap-2 p-3 text-xs text-muted">
            <Icon name="sparkles" />
            <span>Small club. Big community.</span>
          </div>
        </aside>
      </div>
    </>
  );
}
