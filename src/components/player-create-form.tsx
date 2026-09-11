"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiTeam } from "@/lib/member-api";

export function PlayerCreateForm({ teams }: { teams: ApiTeam[] }) {
  const router = useRouter();
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const playerEmail = String(form.get("email") ?? "").trim();
    const guardianEmail = String(form.get("guardian_email") ?? "").trim();
    const inviteEmail = guardianEmail || playerEmail;
    if (!inviteEmail) {
      setError("Add either a player email or a parent / guardian email.");
      setSaving(false);
      return;
    }
    const created = await fetch("/api/dashboard/players", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        team_id: form.get("team_id") || null,
        legal_first_name: form.get("legal_first_name"),
        legal_last_name: form.get("legal_last_name"),
        position: form.get("position") || null,
        date_of_birth: form.get("date_of_birth") || null,
        email: playerEmail || null,
        phone: form.get("phone") || null,
        guardian_name: form.get("guardian_name") || null,
        guardian_email: guardianEmail || null,
        guardian_phone: form.get("guardian_phone") || null,
        fa_fan_id: form.get("fa_fan_id") || null,
        auto_renew_next_season: form.get("auto_renew_next_season") === "on",
        homegrown_player: form.get("homegrown_player") === "on",
        notes: form.get("notes") || null,
      }),
    });
    const player = await created.json().catch(() => null);
    if (!created.ok) {
      setError(player?.detail ?? "Could not add player");
      setSaving(false);
      return;
    }
    const invited = await fetch(`/api/dashboard/players/${player.player_id}/invite`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const result = await invited.json().catch(() => null);
    if (!invited.ok) {
      setError(result?.detail ?? "Player added, but invite could not be created");
      setSaving(false);
      return;
    }
    setInviteUrl(`${window.location.origin}${result.invite_url}`);
    setSaving(false);
  }

  if (inviteUrl) {
    return <section className="panel grid gap-4 p-6">
      <h2 className="text-base font-medium">Invite ready</h2>
      <p className="text-sm text-muted">Share this link with the player or parent / guardian. It expires in seven days.</p>
      <input className="rounded-lg border border-line bg-surface-muted px-3 py-3 text-xs" value={inviteUrl} readOnly />
      <button type="button" className="button-primary rounded-lg px-4 py-3 text-sm" onClick={() => router.push("/dashboard/players")}>Back to players</button>
    </section>;
  }

  return <form className="panel grid gap-5 p-6" onSubmit={submit}>
    <div>
      <h2 className="text-base font-medium">Player details</h2>
      <p className="mt-1 text-xs text-muted">Add the football, registration, and contact information you have available.</p>
    </div>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <label className="grid gap-2 text-sm">First name<input name="legal_first_name" className="rounded-lg border border-line bg-surface-muted px-3 py-3" required /></label>
      <label className="grid gap-2 text-sm">Last name<input name="legal_last_name" className="rounded-lg border border-line bg-surface-muted px-3 py-3" required /></label>
      <label className="grid gap-2 text-sm">Team<select name="team_id" className="rounded-lg border border-line bg-surface-muted px-3 py-3" required>{teams.map((team) => <option key={team.team_id} value={team.team_id}>{team.name}</option>)}</select></label>
      <label className="grid gap-2 text-sm">Position<input name="position" placeholder="e.g. Midfielder" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
      <label className="grid gap-2 text-sm">Date of birth<input name="date_of_birth" type="date" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
      <label className="grid gap-2 text-sm">FA FAN ID<input name="fa_fan_id" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
    </div>
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 text-sm font-medium">Player contact</legend>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <label className="grid gap-2 text-sm">Email<input name="email" type="email" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
        <label className="grid gap-2 text-sm">Phone<input name="phone" type="tel" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
      </div>
    </fieldset>
    <fieldset className="grid gap-4 rounded-xl border border-line p-4">
      <legend className="px-1 text-sm font-medium">Parent / guardian contact</legend>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <label className="grid gap-2 text-sm">Name<input name="guardian_name" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
        <label className="grid gap-2 text-sm">Email<input name="guardian_email" type="email" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
        <label className="grid gap-2 text-sm">Phone<input name="guardian_phone" type="tel" className="rounded-lg border border-line bg-surface-muted px-3 py-3" /></label>
      </div>
      <p className="text-xs text-muted">At least one player or guardian email is required so we can create the registration invite.</p>
    </fieldset>
    <div className="flex flex-wrap gap-5 text-sm">
      <label className="flex items-center gap-2"><input name="auto_renew_next_season" type="checkbox" /> Auto-renew next season</label>
      <label className="flex items-center gap-2"><input name="homegrown_player" type="checkbox" /> Homegrown player</label>
    </div>
    <label className="grid gap-2 text-sm">Notes<textarea name="notes" rows={3} className="rounded-lg border border-line bg-surface-muted px-3 py-3" placeholder="Registration, medical, or coaching notes" /></label>
    {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
    <button className="button-primary rounded-lg px-4 py-3 text-sm" disabled={saving}>{saving ? "Adding player…" : "Add player and create invite"}</button>
  </form>;
}
