"use client";

import { useEffect, useState } from "react";

export function NewsletterAdmin() {
  const [segmentId, setSegmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("<h1>Club news</h1>\n<p>Write your newsletter here.</p>");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/dashboard/newsletter", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(data => { if (data?.segment_id) setSegmentId(data.segment_id); });
  }, []);

  async function saveSegment() {
    setBusy(true); setMessage(null);
    const response = await fetch("/api/dashboard/newsletter", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ segment_id: segmentId }) });
    setBusy(false); setMessage(response.ok ? "Newsletter segment saved." : "Could not save the segment.");
  }

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm(scheduledAt ? "Schedule this newsletter?" : "Send this newsletter now?")) return;
    setBusy(true); setMessage(null);
    const response = await fetch("/api/dashboard/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subject, html: content, scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null }) });
    const data = await response.json().catch(() => null);
    setBusy(false); setMessage(response.ok ? (scheduledAt ? "Newsletter scheduled." : "Newsletter sent.") : data?.detail ?? "Could not send the newsletter.");
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
    <section className="panel p-6">
      <h2 className="text-base font-medium">Resend segment</h2>
      <p className="mt-2 text-sm text-muted">Use a segment filtered by this club&apos;s <code>club_id</code> contact property. Sending is disabled until one is configured.</p>
      <label className="mt-4 grid gap-2 text-sm"><span>Segment ID</span><input value={segmentId} onChange={event => setSegmentId(event.target.value)} className="rounded-lg border border-line bg-surface-muted px-3 py-2" placeholder="re_…" /></label>
      <button onClick={saveSegment} disabled={busy || !segmentId.trim()} className="button-primary mt-4 rounded-lg px-3 py-2 text-sm">Save segment</button>
    </section>
    <section className="panel p-6">
      <h2 className="text-base font-medium">Create newsletter</h2>
      <form className="mt-4 grid gap-3" onSubmit={send}>
        <input required value={subject} onChange={event => setSubject(event.target.value)} className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" placeholder="Subject" />
        <textarea required value={content} onChange={event => setContent(event.target.value)} className="min-h-48 rounded-lg border border-line bg-surface-muted px-3 py-2 font-mono text-sm" aria-label="Newsletter HTML" />
        <label className="grid gap-2 text-sm"><span>Schedule (optional)</span><input type="datetime-local" value={scheduledAt} onChange={event => setScheduledAt(event.target.value)} className="rounded-lg border border-line bg-surface-muted px-3 py-2" /></label>
        <button disabled={busy || !segmentId.trim()} className="button-primary rounded-lg px-3 py-2 text-sm">{scheduledAt ? "Schedule newsletter" : "Send newsletter"}</button>
      </form>
      {message && <p className="mt-3 text-sm text-muted" role="status">{message}</p>}
    </section>
  </div>;
}
