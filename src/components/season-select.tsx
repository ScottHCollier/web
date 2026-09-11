"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SeasonSelect({ seasons, selectedSeason }: { seasons: string[]; selectedSeason: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeSeason(season: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", season);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-muted" htmlFor="fixture-season">
      Season
      <select
        id="fixture-season"
        name="season"
        value={selectedSeason}
        onChange={(event) => changeSeason(event.target.value)}
        className="h-9 rounded-lg border border-line bg-surface px-3 text-xs text-foreground"
      >
        {seasons.map((season) => <option key={season} value={season}>{season}</option>)}
      </select>
    </label>
  );
}
