"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const response = await fetch("/api/auth/password-reset/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    if (!response.ok) { setError((await response.json().catch(() => null))?.detail ?? "Unable to request a password reset"); return; }
    setSent(true);
  }
  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10"><section className="panel w-full max-w-md p-8"><p className="text-xs font-medium tracking-widest text-muted">FINAL THIRD CLUBHOUSE</p><h1 className="mt-3 text-3xl font-medium tracking-tight">Forgot your password?</h1>{sent ? <p className="mt-4 text-sm text-muted">If an account exists for that address, we’ve sent a reset link.</p> : <form className="mt-7 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm">Email<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>{error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}<button className="button-primary rounded-lg px-4 py-3 text-sm font-medium">Email reset link</button></form>}<Link href="/login" className="mt-5 block text-sm text-accent hover:underline">Back to sign in</Link></section></main>;
}
