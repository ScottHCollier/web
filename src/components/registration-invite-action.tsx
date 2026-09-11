"use client";
import { useEffect, useState } from "react";

export function RegistrationInviteAction({ playerId }: { playerId: string }) {
  const [message, setMessage] = useState(""); const [status, setStatus] = useState<"not_sent" | "active" | "expired" | "accepted">("not_sent"); const [email, setEmail] = useState("");
  useEffect(() => { fetch(`/api/dashboard/players/${playerId}/invite`).then(response => response.json()).then(result => { setStatus(result.status); setEmail(result.invited_email ?? ""); }).catch(() => undefined); }, [playerId]);
  async function invite() {
    const email = window.prompt("Parent or guardian email");
    if (!email) return;
    const response = await fetch(`/api/dashboard/players/${playerId}/invite`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json().catch(() => null);
    setMessage(response.ok ? "Invite ready" : result?.detail ?? "Invite failed"); if (response.ok) { setStatus("active"); setEmail(email); }
    if (response.ok && result?.invite_url) await navigator.clipboard?.writeText(`${window.location.origin}${result.invite_url}`);
  }
  async function revoke() { await fetch(`/api/dashboard/players/${playerId}/invite`, { method: "DELETE" }); setStatus("not_sent"); setMessage("Invite revoked"); }
  return <span className="flex items-center gap-2">{status === "active" ? <><span className="text-muted">Sent to {email}</span><button type="button" className="text-accent hover:underline" onClick={invite}>Resend</button><button type="button" className="text-danger hover:underline" onClick={revoke}>Revoke</button></> : <button type="button" className="text-accent hover:underline" onClick={invite}>{status === "expired" ? "Resend invite" : "Invite parent"}</button>}{message && <span className="text-muted" role="status">{message}</span>}</span>;
}
