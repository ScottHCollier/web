"use client";

import { useState } from "react";

export function NewsletterForm({ clubId }: { clubId: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    const response = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ club_id: clubId, email }) });
    const payload = await response.json().catch(() => null);
    setMessage(response.ok ? "You’re on the list." : (payload?.detail ?? "Unable to subscribe right now."));
    if (response.ok) setEmail("");
    setPending(false);
  }
  return <><form className="public-newsletter-form" onSubmit={submit}><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" aria-label="Your email address" /><button type="submit" disabled={pending}>{pending ? "Joining…" : "Sign up"} <span aria-hidden="true">→</span></button>{message ? <span className="sr-only" role="status">{message}</span> : null}</form><p className="mt-2 text-xs opacity-70">By signing up, you agree to receive club news. Unsubscribe at any time.</p></>;
}
