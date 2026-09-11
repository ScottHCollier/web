"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { suggestThemes, type ThemeSuggestion } from "@/lib/badge-theme";

export function BadgeSettings({ initialUrl }: { initialUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [suggestions, setSuggestions] = useState<ThemeSuggestion[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true); setMessage(null); setSuggestions([]);
    const [response, generated] = await Promise.all([fetch("/api/dashboard/badge", { method: "POST", body: (() => { const form = new FormData(); form.append("image", file); return form; })() }), suggestThemes(file).catch(() => [])]);
    const payload = await response.json().catch(() => null);
    setUploading(false);
    if (!response.ok) { setMessage(payload?.detail ?? "Badge upload failed."); return; }
    setUrl(payload.badge_url); setSuggestions(generated); setMessage(generated.length ? "Club badge updated. Choose a theme below." : "Club badge updated.");
  }

  async function applyTheme(suggestion: ThemeSuggestion) {
    setSaving(suggestion.name); setMessage(null);
    const response = await fetch("/api/dashboard/theme", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ theme: suggestion.theme }) });
    setSaving(null);
    if (!response.ok) { const payload = await response.json().catch(() => null); setMessage(payload?.detail ?? "Could not save theme."); return; }
    window.dispatchEvent(new CustomEvent("club-theme-change", { detail: suggestion.theme }));
    setMessage(`${suggestion.name} theme applied.`); setSuggestions([]);
  }

  return <section className="panel p-6" aria-labelledby="badge-settings-title"><div className="flex flex-wrap items-center gap-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-surface-muted">{url ? <Image src={url} alt="Club badge" width={80} height={80} className="h-full w-full object-contain" unoptimized /> : <span className="text-xs text-muted">No badge</span>}</div><div className="min-w-0 flex-1"><h2 id="badge-settings-title" className="text-base font-medium">Club badge</h2><p className="mt-2 text-sm leading-relaxed text-muted">Upload the badge used across your club website and dashboard. We’ll analyse its colours locally and suggest themes.</p></div><button type="button" className="button-primary rounded-lg px-4 py-2 text-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : url ? "Replace badge" : "Upload badge"}</button><input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} /></div>{suggestions.length ? <div className="mt-6"><h3 className="text-sm font-medium">Suggested themes</h3><div className="mt-3 grid gap-3 md:grid-cols-3">{suggestions.map((suggestion) => <div key={suggestion.name} className="rounded-xl border border-line p-3"><div className="flex gap-1">{[suggestion.theme.light.primary, suggestion.theme.light.secondary, suggestion.theme.light.accent].map((colour) => <span key={colour} className="h-8 flex-1 rounded" style={{ backgroundColor: colour }} />)}</div><h4 className="mt-3 text-sm font-medium">{suggestion.name}</h4><p className="mt-1 text-xs text-muted">{suggestion.description}</p><button type="button" className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-xs font-medium" disabled={Boolean(saving)} onClick={() => void applyTheme(suggestion)}>{saving === suggestion.name ? "Applying…" : "Use this theme"}</button></div>)}</div></div> : null}{message ? <p className="mt-4 text-sm text-muted" role="status">{message}</p> : null}</section>;
}
