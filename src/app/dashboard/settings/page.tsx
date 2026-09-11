import type { Metadata } from "next";
import { getCurrentClub } from "@/lib/current-club";
import { PageHeading } from "@/components/page-ui";
import { AppearanceSettings } from "@/components/appearance-settings";

export const metadata: Metadata = { title: "Settings | Final Third" };

export default async function SettingsPage() {
  const { club } = await getCurrentClub();
  return (
    <>
      <PageHeading
        title="Settings"
        description="Manage your personal preferences and account."
      />
      <div className="grid gap-4">
        <AppearanceSettings />
        <section className="panel p-6">
          <h2 className="text-base font-medium">Your account</h2>
          <p className="mt-4 text-sm font-medium">Demo member</p>
          <p className="mt-1 text-sm text-muted">{club.name} owner account</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Personal profile and account preferences will be available here.
          </p>
        </section>
      </div>
    </>
  );
}
