import { getAuthenticatedApiUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function OnboardingPage() {
  const user = await getAuthenticatedApiUser();
  if (!user) redirect("/login?next=/onboarding");
  if (user.memberships.length) redirect("/dashboard");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-2xl">
        <p className="text-xs font-medium tracking-widest text-muted">FINAL THIRD CLUBHOUSE</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">How do you want to get started?</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">Join an existing club with an invite, or create a new clubhouse for your club.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a href="/onboarding/create" className="panel p-6 transition-colors hover:border-accent">
            <span className="text-2xl" aria-hidden="true">＋</span>
            <h2 className="mt-4 text-xl font-medium">Create a club</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Set up your club website, add your first team, and invite your community.</p>
            <span className="mt-6 inline-block text-sm text-accent">Create clubhouse →</span>
          </a>
          <a href="/join" className="panel p-6 transition-colors hover:border-accent">
            <span className="text-2xl" aria-hidden="true">↗</span>
            <h2 className="mt-4 text-xl font-medium">Join a club</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Use the invite link or token sent by your club administrator.</p>
            <span className="mt-6 inline-block text-sm text-accent">Join with invite →</span>
          </a>
        </div>
      </section>
    </main>
  );
}
