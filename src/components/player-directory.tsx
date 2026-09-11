"use client";

import { useState } from "react";
import type { Player } from "@/types/club";
import { Status } from "@/components/page-ui";
import { useClub } from "@/components/club-provider";

export function PlayerDirectory({
  players,
  canViewAll,
  userEmail,
}: {
  players: Player[];
  canViewAll: boolean;
  userEmail: string;
}) {
  const club = useClub();
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("");
  const clubPlayers = players.filter(
    (player) =>
      player.clubId === club.id &&
      (canViewAll || player.guardianEmails?.includes(userEmail)),
  );
  const filtered = clubPlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(search.toLowerCase()) &&
      (!team || player.team === team),
  );
  return (
    <section className="overflow-hidden panel">
      <div className="flex items-end gap-5 border-b border-line bg-surface-muted p-5 max-md:flex-wrap">
        <label className="grid gap-2 text-xs font-medium text-muted ">
          Find a player
          <input
            type="search"
            className="h-9 min-w-56 rounded-lg border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
            placeholder="Search by name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-xs font-medium text-muted ">
          Team
          <select
            className="h-9 min-w-40 rounded-lg border border-line bg-surface px-3 text-xs outline-none focus:border-accent"
            value={team}
            onChange={(event) => setTeam(event.target.value)}
          >
            <option value="">All teams</option>
            {Array.from(new Set(clubPlayers.map((player) => player.team))).map(
              (name) => (
                <option key={name}>{name}</option>
              ),
            )}
          </select>
        </label>
        <span className="ml-auto text-xs text-muted " aria-live="polite">{filtered.length} players</span>
      </div>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Player</th>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Team / position</th>
              <th className="border-b border-line px-5 py-4 text-xs font-medium uppercase tracking-wider text-muted">Registration</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((player) => (
              <tr key={player.id}>
                  <td className="border-b border-line px-5 py-4">
                  <strong>{player.name}</strong>
                </td>
                <td className="border-b border-line px-5 py-4"><div>{player.team}</div><div className="mt-1 text-muted">{player.position ?? "Position not set"}</div></td>
                <td className="border-b border-line px-5 py-4">
                  <Status>{player.registration}</Status>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="p-8 text-center text-xs text-muted ">
          No players match your search. Try another name or team.
        </div>
      )}
    </section>
  );
}
