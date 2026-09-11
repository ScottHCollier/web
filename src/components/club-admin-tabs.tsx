"use client";

import type { ReactNode } from "react";
import { useState } from "react";

const tabs = [
  ["appearance", "Appearance"],
  ["media", "Media"],
  ["club-details", "Club details"],
] as const;

export function ClubAdminTabs({ panels }: { panels: Record<string, ReactNode> }) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0][0]);

  function moveTab(direction: 1 | -1) {
    const currentIndex = tabs.findIndex(([id]) => id === activeTab);
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    setActiveTab(tabs[nextIndex][0]);
    document.getElementById(`club-admin-tab-${tabs[nextIndex][0]}`)?.focus();
  }

  return <div>
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Club admin sections">
      {tabs.map(([id, label]) => <button
        key={id}
        id={`club-admin-tab-${id}`}
        type="button"
        role="tab"
        aria-selected={activeTab === id}
        aria-controls={`club-admin-panel-${id}`}
        tabIndex={activeTab === id ? 0 : -1}
        className={`rounded-lg px-3 py-2 text-sm ${activeTab === id ? "bg-accent-soft text-accent" : "border border-line text-muted hover:bg-surface-muted"}`}
        onClick={() => setActiveTab(id)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); moveTab(1); }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); moveTab(-1); }
          if (event.key === "Home") { event.preventDefault(); setActiveTab(tabs[0][0]); document.getElementById(`club-admin-tab-${tabs[0][0]}`)?.focus(); }
          if (event.key === "End") { event.preventDefault(); setActiveTab(tabs[tabs.length - 1][0]); document.getElementById(`club-admin-tab-${tabs[tabs.length - 1][0]}`)?.focus(); }
        }}
      >{label}</button>)}
    </div>
    {tabs.map(([id]) => activeTab === id ? <div key={id} id={`club-admin-panel-${id}`} role="tabpanel" aria-labelledby={`club-admin-tab-${id}`} tabIndex={0} className="mt-4 grid gap-4">{panels[id]}</div> : null)}
  </div>;
}
