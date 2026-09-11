"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

type Step = { id: string; title: string; description: string; href: string; complete: boolean };

function subscribeToSetupCompletion(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("setup-complete", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("setup-complete", callback);
  };
}

function getSetupCompletionSnapshot() {
  return window.localStorage.getItem(`final-third-setup-complete:${window.location.hostname}`) === "true";
}

function getManualSetupSnapshot() {
  return window.localStorage.getItem("final-third-setup") ?? "{}";
}

function parseManualSetup(value: string) {
  try { return JSON.parse(value) as Record<string, boolean>; } catch { return {}; }
}

export function ClubSetupGuide({ initial }: { initial: { teams: number; connectedTeams: number; contactReady: boolean; safeguardingReady: boolean } }) {
  const [images, setImages] = useState(0);
  const [articles, setArticles] = useState(0);
  const manualSnapshot = useSyncExternalStore(subscribeToSetupCompletion, getManualSetupSnapshot, () => "{}");
  const manual = useMemo(() => parseManualSetup(manualSnapshot), [manualSnapshot]);
  const setupComplete = useSyncExternalStore(subscribeToSetupCompletion, getSetupCompletionSnapshot, () => false);
  const router = useRouter();
  useEffect(() => {
    void Promise.all([fetch("/api/dashboard/images", { cache: "no-store" }), fetch("/api/dashboard/articles", { cache: "no-store" })]).then(async ([imageResponse, articleResponse]) => {
      if (imageResponse.ok) setImages((await imageResponse.json() as unknown[]).length);
      if (articleResponse.ok) setArticles((await articleResponse.json() as unknown[]).length);
    });
  }, []);
  const steps = useMemo<Step[]>(() => [
    { id: "teams", title: "Set up your teams", description: initial.teams ? `${initial.teams} team${initial.teams === 1 ? "" : "s"} added${initial.connectedTeams ? ` · ${initial.connectedTeams} connected to FA Full-Time` : ""}.` : "Add your first team. Connecting FA Full-Time is optional.", href: "/dashboard/teams", complete: initial.teams > 0 },
    { id: "appearance", title: "Shape your website", description: "Choose your badge, theme, and homepage hero carousel.", href: "/dashboard/club-settings", complete: Boolean(manual.appearance) },
    { id: "media", title: "Add your media", description: images ? `${images} image${images === 1 ? "" : "s"} in your library.` : "Upload a few images for your homepage and news stories.", href: "/dashboard/club-settings#media", complete: images > 0 },
    { id: "contact", title: "Add club contact details", description: "Help visitors get in touch with the club.", href: "/contact?edit=1", complete: initial.contactReady },
    { id: "safeguarding", title: "Publish safeguarding details", description: "Add your welfare officer contact and public documents.", href: "/safeguarding?edit=1", complete: initial.safeguardingReady },
    { id: "article", title: "Publish your first article", description: articles ? `${articles} article${articles === 1 ? "" : "s"} ready.` : "Share a welcome message or your latest club news.", href: "/news?edit=1", complete: articles > 0 },
  ], [articles, images, initial, manual]);
  const completed = steps.filter((step) => step.complete).length;
  function markComplete(id: string) {
    const next = { ...manual, [id]: true };
    window.localStorage.setItem("final-third-setup", JSON.stringify(next));
    window.dispatchEvent(new Event("setup-complete"));
  }
  function finish() {
    window.localStorage.setItem(`final-third-setup-complete:${window.location.hostname}`, "true");
    window.dispatchEvent(new Event("setup-complete"));
    router.push("/dashboard");
  }
  if (setupComplete) return null;
  return <section className="grid gap-5" aria-labelledby="setup-guide-title"><div className="panel overflow-hidden"><div className="bg-primary p-6 text-primary-foreground sm:p-8"><p className="text-xs font-bold uppercase tracking-widest opacity-75">FIRST things first</p><h2 id="setup-guide-title" className="mt-2 text-3xl font-medium tracking-tight">Set up your clubhouse</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-80">Complete the essentials once, then share a polished public site with your players, families, and community.</p><div className="mt-6 flex items-center gap-3"><div className="h-2 min-w-0 flex-1 rounded-full bg-primary-foreground/20"><div className="h-2 rounded-full bg-secondary transition-all" style={{ width: `${Math.round(completed / steps.length * 100)}%` }} /></div><strong className="text-sm">{completed}/{steps.length}</strong></div></div><div className="grid gap-2 p-4 sm:p-6">{steps.map((step, index) => <article key={step.id} className={`flex items-start gap-4 rounded-xl border p-4 ${step.complete ? "border-success/40 bg-success/5" : "border-line"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${step.complete ? "bg-success text-success-foreground" : "bg-accent-soft text-accent"}`}>{step.complete ? "✓" : index + 1}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{step.title}</h3><p className="mt-1 text-sm text-muted">{step.description}</p></div><div className="flex shrink-0 flex-wrap justify-end gap-2"><Link href={step.href} className="rounded-lg border border-line px-3 py-2 text-xs text-accent hover:border-accent">{step.complete ? "Review" : "Open"}</Link>{!step.complete && step.id === "appearance" ? <button type="button" className="rounded-lg px-2 py-2 text-xs text-muted hover:text-accent" onClick={() => markComplete(step.id)} aria-label="Mark website setup complete">Mark done</button> : null}</div></article>)}</div></div><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">You can return to this guide from the dashboard at any time.</p><div className="flex gap-3">{completed === steps.length ? <button type="button" className="button-primary rounded-lg px-4 py-2 text-sm" onClick={finish}>Finish setup</button> : null}<Link href="/dashboard" className="text-sm text-accent hover:underline">Go to dashboard →</Link></div></div></section>;
}
