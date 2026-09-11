"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiTeam } from "@/lib/member-api";

export function FixtureCreateForm({ teams }: { teams: ApiTeam[] }) {
  const router = useRouter();
  const [teamId, setTeamId] = useState(teams[0]?.team_id ?? "");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [venue, setVenue] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    const response = await fetch("/api/dashboard/fixtures", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        teamId,
        title,
        startsAt: new Date(startsAt).toISOString(),
        venue,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setStatus("Could not create fixture.");
      return;
    }
    router.push("/dashboard/fixtures");
    router.refresh();
  }

  return (
    <form className="panel grid gap-4 p-5" onSubmit={submit}>
      <div>
        <h2 className="text-base font-medium">Add a fixture</h2>
        <p className="mt-1 text-xs text-muted">Create a match or training session for a team.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <label className="grid gap-2 text-xs font-medium text-muted">
          Team
          <select className="h-10 rounded-lg border border-line bg-surface px-3 text-xs" value={teamId} onChange={(event) => setTeamId(event.target.value)} required>
            {teams.map((team) => <option key={team.team_id} value={team.team_id}>{team.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-medium text-muted">
          Title
          <input className="h-10 rounded-lg border border-line bg-surface px-3 text-xs" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="vs. Meadow Athletic" required />
        </label>
        <label className="grid gap-2 text-xs font-medium text-muted">
          Date and time
          <input type="datetime-local" className="h-10 rounded-lg border border-line bg-surface px-3 text-xs" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
        </label>
        <label className="grid gap-2 text-xs font-medium text-muted">
          Venue
          <input className="h-10 rounded-lg border border-line bg-surface px-3 text-xs" value={venue} onChange={(event) => setVenue(event.target.value)} placeholder="Riverside Recreation Ground" required />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="button-primary rounded-lg px-4 py-2 text-xs" disabled={saving || !teams.length}>{saving ? "Creating…" : "Create fixture"}</button>
        <p className="text-xs text-muted" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}
