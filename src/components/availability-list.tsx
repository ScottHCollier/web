"use client";

import { useState } from "react";
import { formatDate } from "@/components/page-ui";
import type { ApiAttendance, ApiAvailability, ApiFixture, ApiPlayer, ApiSelection, ApiTeam } from "@/lib/member-api";

export function AvailabilityList({
  fixtures,
  players,
  teams,
  initialAvailability,
  initialSelection,
  initialAttendance,
  canManage,
}: {
  fixtures: ApiFixture[];
  players: ApiPlayer[];
  teams: ApiTeam[];
  initialAvailability: Record<string, ApiAvailability[]>;
  initialSelection: Record<string, ApiSelection[]>;
  initialAttendance: Record<string, ApiAttendance[]>;
  canManage: boolean;
}) {
  const [teamFilter, setTeamFilter] = useState("all");
  const [fixtureFilter, setFixtureFilter] = useState("all");
  const [responses, setResponses] = useState<Record<string, ApiAvailability["status"]>>(
    Object.fromEntries(
      Object.values(initialAvailability)
        .flat()
        .map((response) => [`${response.fixture_id}:${response.player_id}`, response.status]),
    ),
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.values(initialAvailability)
        .flat()
        .map((response) => [`${response.fixture_id}:${response.player_id}`, response.note ?? ""]),
    ),
  );
  const [selections, setSelections] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.values(initialSelection).flat().map((item) => [`${item.fixture_id}:${item.player_id}`, item.selected])),
  );
  const [attendance, setAttendance] = useState<Record<string, ApiAttendance["status"]>>(
    Object.fromEntries(Object.values(initialAttendance).flat().map((item) => [`${item.fixture_id}:${item.player_id}`, item.status])),
  );
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function choose(fixtureId: string, playerId: string, status: ApiAvailability["status"]) {
    const key = `${fixtureId}:${playerId}`;
    setResponses((previous) => ({ ...previous, [key]: status }));
    setSaving(key);
    setMessage(null);
    const response = await fetch("/api/dashboard/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fixtureId, playerId, status, note: notes[key] ?? "" }),
    });
    setSaving(null);
    setMessage(response.ok ? "Availability saved." : "Could not save availability.");
  }

  async function saveNote(fixtureId: string, playerId: string) {
    const key = `${fixtureId}:${playerId}`;
    const status = responses[key];
    if (status) await choose(fixtureId, playerId, status);
  }

  async function toggleSelection(fixtureId: string, playerId: string) {
    const key = `${fixtureId}:${playerId}`;
    const selected = !selections[key];
    setSelections((previous) => ({ ...previous, [key]: selected }));
    setSaving(key);
    const response = await fetch("/api/dashboard/selection", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fixtureId, playerId, selected }),
    });
    setSaving(null);
    setMessage(response.ok ? "Squad selection saved." : "Could not save squad selection.");
  }

  async function recordAttendance(fixtureId: string, playerId: string, status: ApiAttendance["status"]) {
    const key = `${fixtureId}:${playerId}`;
    setAttendance((previous) => ({ ...previous, [key]: status }));
    setSaving(key);
    const response = await fetch("/api/dashboard/attendance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fixtureId, playerId, status }),
    });
    setSaving(null);
    setMessage(response.ok ? "Attendance saved." : "Could not save attendance.");
  }

  const visibleFixtures = fixtures.filter((fixture) =>
    (teamFilter === "all" || fixture.team_id === teamFilter)
    && (fixtureFilter === "all" || fixture.fixture_id === fixtureFilter),
  );

  function summary(fixtureId: string, teamId: string) {
    const roster = players.filter((player) => player.team_id === teamId);
    const counts = { available: 0, maybe: 0, unavailable: 0, pending: 0, selected: 0, attended: 0, late: 0, absent: 0, injured: 0 };
    for (const player of roster) {
      const status = responses[`${fixtureId}:${player.player_id}`];
      if (status) counts[status] += 1;
      else counts.pending += 1;
      if (selections[`${fixtureId}:${player.player_id}`]) counts.selected += 1;
      const attendanceStatus = attendance[`${fixtureId}:${player.player_id}`];
      if (attendanceStatus) counts[attendanceStatus] += 1;
    }
    return { ...counts, total: roster.length };
  }

  return (
    <div className="grid gap-4">
      <section className="panel grid gap-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">Matchday responses</h2>
            <p className="mt-1 text-xs text-muted">See who is available and update a response at any time.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="grid gap-1 text-[10px] font-medium uppercase tracking-wider text-muted">
              Team
              <select className="h-9 rounded-lg border border-line bg-surface px-2 text-xs normal-case tracking-normal" value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); setFixtureFilter("all"); }}>
                <option value="all">All teams</option>
                {teams.map((team) => <option key={team.team_id} value={team.team_id}>{team.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-[10px] font-medium uppercase tracking-wider text-muted">
              Fixture
              <select className="h-9 max-w-56 rounded-lg border border-line bg-surface px-2 text-xs normal-case tracking-normal" value={fixtureFilter} onChange={(event) => setFixtureFilter(event.target.value)}>
                <option value="all">All fixtures</option>
                {fixtures.filter((fixture) => teamFilter === "all" || fixture.team_id === teamFilter).map((fixture) => <option key={fixture.fixture_id} value={fixture.fixture_id}>{fixture.title}</option>)}
              </select>
            </label>
          </div>
        </div>
        {!visibleFixtures.length && <p className="rounded-lg bg-surface-muted p-4 text-sm text-muted">No fixtures match these filters.</p>}
      </section>
      {visibleFixtures.map((fixture) => (
          <section className="flex items-start justify-between gap-7 panel p-6 max-md:flex-col" key={fixture.fixture_id}>
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-muted">
                {teams.find((team) => team.team_id === fixture.team_id)?.name ?? "Team"}
              </p>
              <h2 className="text-base font-medium tracking-tight">{fixture.title}</h2>
              <p>{formatDate(fixture.starts_at)}</p>
              <p className="text-sm leading-loose text-muted ">{fixture.venue}</p>
              {(() => {
                const counts = summary(fixture.fixture_id, fixture.team_id);
                return <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-md bg-success px-2 py-1 text-success-foreground">{counts.available} available</span>
                  <span className="rounded-md bg-warning px-2 py-1 text-warning-foreground">{counts.maybe} maybe</span>
                  <span className="rounded-md bg-danger px-2 py-1 text-danger-foreground">{counts.unavailable} unavailable</span>
                  <span className="rounded-md bg-surface-muted px-2 py-1 text-muted">{counts.pending} awaiting</span>
                  <span className="rounded-md bg-accent-soft px-2 py-1 text-accent">{counts.selected} selected</span>
                  <span className="rounded-md bg-success px-2 py-1 text-success-foreground">{counts.attended} attended</span>
                  <span className="rounded-md bg-warning px-2 py-1 text-warning-foreground">{counts.late} late</span>
                  <span className="rounded-md bg-danger px-2 py-1 text-danger-foreground">{counts.absent + counts.injured} not attended</span>
                </div>;
              })()}
            </div>
            <div className="grid gap-3">
              {players.filter((player) => player.team_id === fixture.team_id).map((player) => {
                const key = `${fixture.fixture_id}:${player.player_id}`;
                return <fieldset key={player.player_id}>
                  <legend>{player.legal_first_name} {player.legal_last_name}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(["available", "maybe", "unavailable"] as const).map((status) => (
                      <button type="button" className={`rounded-lg border px-3 py-2 text-xs transition-colors hover:border-accent hover:bg-accent-soft ${responses[key] === status ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-muted"}`} key={status} aria-pressed={responses[key] === status} disabled={saving === key} onClick={() => choose(fixture.fixture_id, player.player_id, status)}>
                        {status[0].toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <input
                    className="mt-2 h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs"
                    value={notes[key] ?? ""}
                    onChange={(event) => setNotes((previous) => ({ ...previous, [key]: event.target.value }))}
                    placeholder="Optional note for the coach"
                    maxLength={500}
                  />
                  {responses[key] && <button type="button" className="justify-self-start text-[11px] text-accent hover:underline" disabled={saving === key} onClick={() => saveNote(fixture.fixture_id, player.player_id)}>{saving === key ? "Saving…" : "Save note"}</button>}
                  {canManage ? <button type="button" className={`mt-2 justify-self-start rounded-lg border px-3 py-2 text-xs ${selections[key] ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-muted"}`} disabled={saving === key} onClick={() => toggleSelection(fixture.fixture_id, player.player_id)} aria-pressed={selections[key] ?? false}>{selections[key] ? "Selected for squad" : "Select for squad"}</button> : selections[key] && <span className="mt-2 text-xs font-medium text-accent">Selected for squad</span>}
                  {canManage ? <div className="mt-2 flex flex-wrap gap-1"><span className="w-full text-[10px] uppercase tracking-wider text-muted">Attendance</span>{(["attended", "late", "absent", "injured"] as const).map((status) => <button type="button" key={status} className={`rounded-md border px-2 py-1 text-[11px] ${attendance[key] === status ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-muted"}`} disabled={saving === key} onClick={() => recordAttendance(fixture.fixture_id, player.player_id, status)} aria-pressed={attendance[key] === status}>{status[0].toUpperCase() + status.slice(1)}</button>)}</div> : attendance[key] && <span className="mt-2 text-xs text-muted">Attendance: {attendance[key]}</span>}
                </fieldset>;
              })}
              <p className="text-xs text-muted" aria-live="polite">{message ?? "Availability is saved for this fixture."}</p>
            </div>
          </section>
        ))}
    </div>
  );
}
