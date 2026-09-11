import Link from "next/link";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  let success = false;
  let message = "This verification link is invalid or expired.";
  if (token) {
    const response = await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/auth/verify-email`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }), cache: "no-store" });
    success = response.ok;
    message = success ? "Your email address has been verified." : ((await response.json().catch(() => null))?.detail ?? message);
  }
  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10"><section className="panel w-full max-w-md p-8"><p className="text-xs font-medium tracking-widest text-muted">FINAL THIRD CLUBHOUSE</p><h1 className="mt-3 text-3xl font-medium tracking-tight">{success ? "Email verified" : "Verification failed"}</h1><p className="mt-3 text-sm text-muted">{message}</p><Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">Continue to sign in →</Link></section></main>;
}
