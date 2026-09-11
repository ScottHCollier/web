import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { clubOrigin } from "@/lib/club-host";
import { getCurrentClub, getCurrentClubRole } from "@/lib/current-club";
import { canAccessRole } from "@/lib/roles";
import { PageHeading } from "@/components/page-ui";
import { ThemeSettings } from "@/components/theme-settings";
import { BadgeSettings } from "@/components/badge-settings";
import { HeroImageSettings } from "@/components/hero-image-settings";
import { ImageLibrary } from "@/components/image-library";
import { SafeguardingContactSettings } from "@/components/safeguarding-contact-settings";
import { getSafeguardingSettings } from "@/lib/safeguarding-api";
import { ClubAdminTabs } from "@/components/club-admin-tabs";

export const metadata: Metadata = { title: "Club admin | Final Third" };

export default async function ClubSettingsPage() {
  const { club } = await getCurrentClub();
  const role = await getCurrentClubRole(club.id);
  if (!canAccessRole(role, "admin")) notFound();
  const safeguarding = await getSafeguardingSettings();

  const host = (await headers()).get("host") ?? "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "localhost";
  const domains = [{ hostname: baseDomain === "localhost" ? `${club.slug}.localhost` : `${club.slug}.${baseDomain}` }];

  return (
    <>
      <PageHeading
        title="Club admin"
        description="Manage the shared appearance, media and news published by your club."
      />
      <div className="grid gap-4">
        <ClubAdminTabs panels={{
          appearance: <><ThemeSettings theme={club.theme} /><BadgeSettings initialUrl={club.badgeUrl} /><HeroImageSettings /></>,
          media: <ImageLibrary />,
          "club-details": <>
            <SafeguardingContactSettings initial={safeguarding} />
        <section className="panel p-6">
          <h2 className="text-base font-medium">Domains</h2>
          <p className="mt-2 text-sm text-muted">
            The addresses where members can access your clubhouse.
          </p>
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {domains.map(({ hostname }) => (
              <li
                key={hostname}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <span className="min-w-0 break-all text-sm font-medium">
                  {new URL(clubOrigin(hostname, host)).host}
                </span>
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-muted">
                  Default
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Custom domains, such as app.montpellier.com, are coming soon.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 cursor-not-allowed rounded-lg border border-line px-4 py-2 text-sm text-muted opacity-60"
          >
            Add custom domain
          </button>
          </section>
        </>,
        }} />
      </div>
    </>
  );
}
