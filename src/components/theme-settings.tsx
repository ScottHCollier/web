"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { themeGroups, type ClubTheme } from "@/lib/club-themes";

export function ThemeSettings({ theme }: { theme: ClubTheme }) {
  const [value, setValue] = useState(theme);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const next = (event as CustomEvent<ClubTheme>).detail;
      if (next) setValue(next);
    };
    window.addEventListener("club-theme-change", handleThemeChange);
    return () => window.removeEventListener("club-theme-change", handleThemeChange);
  }, []);

  async function save(next: ClubTheme) {
    setValue(next); setSaving(true); setMessage(null);
    const response = await fetch("/api/dashboard/theme", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ theme: next }) });
    const payload = await response.json().catch(() => null);
    setSaving(false); setMessage(response.ok ? "Theme saved." : payload?.detail ?? "Could not save theme.");
    if (response.ok) window.dispatchEvent(new CustomEvent("club-theme-change", { detail: next }));
  }

  function change(mode: "light" | "dark", key: keyof ClubTheme["light"], colour: string) {
    setValue((current) => ({ ...current, [mode]: { ...current[mode], [key]: colour } }));
  }

  return <section className="panel p-6" aria-labelledby="theme-title">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id="theme-title" className="text-base font-medium">Club theme</h2><p className="mt-2 text-sm text-muted">Edit the colours used across your website and dashboard. Badge-based suggestions appear after an upload.</p></div><button type="button" className="button-primary rounded-lg px-4 py-2 text-sm" disabled={saving} onClick={() => void save(value)}>{saving ? "Saving…" : "Save theme"}</button></div>
    {message ? <p className="mt-4 text-sm text-muted" role="status">{message}</p> : null}
    <div className="mt-5 grid gap-6 lg:grid-cols-2">{(["light", "dark"] as const).map((mode) => { const palette = value[mode]; const style = Object.fromEntries(Object.entries(palette).map(([key, colour]) => [`--${key}`, colour])) as CSSProperties; return <div key={mode}>
      <h3 className="mb-3 text-sm font-medium">{mode === "light" ? "Light palette" : "Dark palette"}</h3>
      <div style={{ ...style, colorScheme: mode }} className="rounded-xl border border-line bg-background p-4 text-foreground"><div className="rounded-lg bg-primary p-4 text-primary-foreground"><p className="font-medium">One club. Everyone counts.</p></div><div className="mt-3 rounded-lg border border-line bg-surface p-4"><p className="text-sm font-medium">Your clubhouse</p><p className="mt-2 text-xs text-muted">Cards and text adapt to your chosen appearance.</p><div className="mt-3 flex flex-wrap items-center gap-3"><span className="button-primary rounded-lg px-4 py-2 text-xs">Primary button</span><span className="rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">Secondary</span><span className="text-xs text-accent">Accent text</span></div></div></div>
      {themeGroups.map((group) => <details key={group.title} className="mt-3 rounded-lg border border-line p-3"><summary className="cursor-pointer text-sm font-medium">{group.title}</summary><dl className="mt-3 grid gap-3 sm:grid-cols-2">{group.fields.map(([key, label]) => <label key={key} className="flex items-center gap-3"><span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md border border-line" style={{ backgroundColor: palette[key] }} /><span><span className="block text-xs">{label}</span><input aria-label={`${mode} ${label}`} type="color" value={palette[key]} onChange={(event) => change(mode, key, event.target.value)} className="mt-1 h-7 w-14 cursor-pointer rounded border-0 bg-transparent p-0" /></span></label>)}</dl></details>)}
    </div>; })}</div>
  </section>;
}
