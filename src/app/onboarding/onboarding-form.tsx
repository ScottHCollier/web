"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const [clubName, setClubName] = useState("");
  const [slug, setSlug] = useState("");
  const [teamName, setTeamName] = useState("");
  const [fullTimeUrl, setFullTimeUrl] = useState("");
  const [fullTimeLeague, setFullTimeLeague] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const clubResponse = await fetch("/api/onboarding/club", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: clubName, slug }) });
    const club = await clubResponse.json().catch(() => null);
    if (!clubResponse.ok) { setError(club?.detail ?? "Could not create your club"); setSaving(false); return; }
    const fullTimeInput = fullTimeUrl.trim();
    const match = fullTimeInput.match(/[?&]teamID=([^&]+)/i) ?? fullTimeInput.match(/^(\d+)$/);
    const externalId = match?.[1];
    const league = (fullTimeInput.match(/[?&](?:league|leagueID)=([^&]+)/i)?.[1] ?? fullTimeLeague.trim()) || undefined;
    const teamResponse = await fetch(`/api/onboarding/club/${club.club_id}/team`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: teamName, ...(externalId ? { external_provider: "fa_full_time", external_id: externalId, external_league_id: league, external_url: fullTimeInput.startsWith("http") ? fullTimeInput : `https://fulltime.thefa.com/displayTeam.html?teamID=${externalId}${league ? `&league=${league}` : ""}` } : {}) }) });
    if (!teamResponse.ok) { const payload = await teamResponse.json().catch(() => null); setError(payload?.detail ?? "Club created, but the first team could not be added"); setSaving(false); return; }
    router.push(`/api/dashboard/select-club?club_id=${encodeURIComponent(club.club_id)}&next=${encodeURIComponent("/dashboard/setup")}`);
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "localhost";
  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10"><section className="panel w-full max-w-lg p-8"><p className="text-xs font-medium tracking-widest text-muted">FINAL THIRD CLUBHOUSE</p><h1 className="mt-3 text-3xl font-medium tracking-tight">Set up your club</h1><p className="mt-2 text-sm leading-relaxed text-muted">Create your clubhouse and add the first team. You can invite families and add more teams later.</p><form className="mt-7 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm">Club name<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" value={clubName} onChange={e => { setClubName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} required /></label><label className="grid gap-2 text-sm">Club address<span className="flex items-center gap-2"><span className="text-muted">https://</span><input className="min-w-0 flex-1 rounded-lg border border-line bg-surface-muted px-3 py-3" value={slug} onChange={e => setSlug(e.target.value)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /><span className="text-muted">.{baseDomain}</span></span></label><label className="grid gap-2 text-sm">First team<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. Under 12s" required /></label><label className="grid gap-2 text-sm">FA Full-Time team ID <span className="font-normal text-muted">(optional)</span><input className="rounded-lg border border-line bg-surface-muted px-3 py-3" value={fullTimeUrl} onChange={e => setFullTimeUrl(e.target.value)} placeholder="e.g. 963186578" /></label><label className="grid gap-2 text-sm">FA Full-Time league ID <span className="font-normal text-muted">(optional)</span><input className="rounded-lg border border-line bg-surface-muted px-3 py-3" value={fullTimeLeague} onChange={e => setFullTimeLeague(e.target.value)} placeholder="e.g. 516676" /></label>{error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}<button className="button-primary rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-60" disabled={saving}>{saving ? "Creating your clubhouse…" : "Create clubhouse"}</button></form></section></main>;
}
