"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match"); setPending(false); return;
    }
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { setError(payload?.detail ?? "Unable to authenticate"); setPending(false); return; }
    router.push(mode === "register" ? "/verify-email" : !payload?.user?.memberships?.length ? "/onboarding" : nextPath);
  }
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
      <section className="panel w-full max-w-md p-8">
        <Link href="/" className="text-sm text-muted hover:text-accent">← Back to club</Link>
        <p className="mb-2 mt-10 text-xs font-medium tracking-widest text-muted">FINAL THIRD CLUBHOUSE</p>
        <h1 className="text-3xl font-medium tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{mode === "login" ? "Sign in to continue to your club workspace." : "Set up your clubhouse account in a moment."}</p>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm">Email<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label className="grid gap-2 text-sm">Password<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          {mode === "register" ? <label className="grid gap-2 text-sm">Confirm password<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" /></label> : null}
          {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
          <button className="button-primary rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-60" disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        {mode === "login" ? <Link href="/forgot-password" className="mt-4 block text-sm text-accent hover:underline">Forgot your password?</Link> : null}
        <button type="button" className="mt-5 text-sm text-accent hover:underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}</button>
      </section>
    </main>
  );
}
