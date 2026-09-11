"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FixtureSyncButton({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<{ tone: "muted" | "danger" | "success"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function sync() {
    setPending(true); setState(null);
    const response = await fetch("/api/dashboard/fixtures/import", { method: "POST" });
    const payload = await response.json().catch(() => null);
    setPending(false);
    if (!response.ok) { setState({ tone: "danger", text: payload?.detail ?? "Sync failed" }); return; }
    if (payload.status !== "queued") {
      setState({ tone: "success", text: `${payload.created} new · ${payload.updated} updated${payload.skipped ? ` · ${payload.skipped} skipped` : ""}` });
      router.refresh();
      return;
    }
    setState({ tone: "muted", text: "Sync queued…" });
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 1500));
      const statusResponse = await fetch("/api/dashboard/fixtures/import", { cache: "no-store" });
      const runs = await statusResponse.json().catch(() => null);
      const run = Array.isArray(runs) ? runs[0] : null;
      if (run?.status === "complete") {
        setState({ tone: "success", text: `${run.created_count} new · ${run.updated_count} updated` });
        router.refresh();
        return;
      }
      if (run?.status === "failed") {
        setState({ tone: "danger", text: run.error ?? "Sync failed" });
        router.refresh();
        return;
      }
      setState({ tone: "muted", text: run?.status === "running" ? "Sync in progress…" : "Sync queued…" });
    }
    setState({ tone: "muted", text: "Sync is still running; refresh shortly" });
  }

  return <div className="flex items-center gap-2"><button type="button" onClick={sync} disabled={!connected || pending} title={connected ? "Sync linked FA Full-Time fixtures" : "Connect a FA Full-Time team first"} className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Syncing…" : "Sync Full-Time"}</button>{state && <span className={`text-xs ${state.tone === "danger" ? "text-danger" : state.tone === "success" ? "text-success-foreground" : "text-muted"}`} role="status">{state.text}</span>}</div>;
}
