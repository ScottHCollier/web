"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { ClubRole } from "@/types/club";
import { canAccessRole } from "@/lib/roles";
import { dashboardHref, dashboardNavigation } from "@/lib/navigation";
export function WorkspaceSearch({ role }: { role: ClubRole }) {
  const [query, setQuery] = useState("");
  const results = dashboardNavigation.filter(([, label, , minimumRole]) =>
    canAccessRole(role, minimumRole) && label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div
      className="relative flex h-9 w-72 items-center gap-2 rounded-lg bg-surface px-3 text-muted max-xl:w-60 max-md:w-full"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setQuery("");
      }}
    >
      <Icon name="search" />
      <input
        className="h-full min-w-0 w-full border-0 bg-transparent p-0 text-xs outline-none placeholder:text-muted"
        aria-label="Search club pages"
        placeholder="Find something in your club…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
        }}
      />
      {query.trim() && (
        <div className="absolute left-0 top-11 z-40 w-full rounded-xl border border-line bg-surface p-2 shadow-xl shadow-shadow/15">
          <p className="mb-2 text-xs font-medium tracking-widest text-muted">CLUB PAGES</p>
          {results.length ? (
            results.map(([route, title]) => (
              <Link
                key={route}
                className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2.5 text-xs text-foreground hover:bg-accent-soft "
                href={dashboardHref(route)}
                onClick={() => setQuery("")}
              >
                {title}
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            ))
          ) : (
            <p role="status">No matching pages</p>
          )}
        </div>
      )}
    </div>
  );
}
