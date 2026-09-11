"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = invite.trim();
    let token = value;
    try { token = new URL(value).searchParams.get("token") ?? value; } catch { /* token pasted directly */ }
    if (!token) { setError("Enter your club invite link or token"); return; }
    router.push(`/register/player?token=${encodeURIComponent(token)}`);
  }

  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10"><section className="panel w-full max-w-md p-8"><Link href="/onboarding" className="text-sm text-muted hover:text-accent">← Back</Link><p className="mb-2 mt-10 text-xs font-medium tracking-widest text-muted">JOIN A CLUB</p><h1 className="text-3xl font-medium tracking-tight">Enter your invite</h1><p className="mt-2 text-sm leading-relaxed text-muted">Paste the invite link or token sent by your club administrator.</p><form className="mt-7 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm">Invite link or token<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" value={invite} onChange={event => setInvite(event.target.value)} required /></label>{error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}<button className="button-primary rounded-lg px-4 py-3 text-sm font-medium">Continue</button></form></section></main>;
}
