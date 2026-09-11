"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const response = await fetch("/api/auth/password-reset/confirm", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: params.get("token") ?? "", password }),
    });
    if (!response.ok) { setError((await response.json().catch(() => null))?.detail ?? "This reset link is invalid or expired"); return; }
    setMessage("Your password has been reset. You can now sign in.");
  }
  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10"><section className="panel w-full max-w-md p-8"><p className="text-xs font-medium tracking-widest text-muted">FINAL THIRD CLUBHOUSE</p><h1 className="mt-3 text-3xl font-medium tracking-tight">Reset your password</h1><form className="mt-7 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm">New password<input className="rounded-lg border border-line bg-surface-muted px-3 py-3" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label>{error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}{message && <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success" role="status">{message}</p>}<button className="button-primary rounded-lg px-4 py-3 text-sm font-medium">Reset password</button></form><Link href="/login" className="mt-5 block text-sm text-accent hover:underline">Back to sign in</Link></section></main>;
}
