"use client";

import { useState } from "react";
import type { ApiPayment } from "@/lib/payment-api";

type PlayerOption = { id: string; name: string };

export function PaymentLedger({
  initialPayments,
  players,
  canManage,
}: {
  initialPayments: ApiPayment[];
  players: PlayerOption[];
  canManage: boolean;
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/dashboard/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        player_id: form.get("player_id"),
        description: form.get("description"),
        amount_pence: Math.round(Number(form.get("amount")) * 100),
        due_date: form.get("due_date") || null,
      }),
    });
    const payment = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) {
      setMessage(payment?.detail ?? "Could not create payment");
      return;
    }
    setPayments((current) => [...current, payment].sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999")));
    setMessage("Payment record added.");
    event.currentTarget.reset();
  }

  async function setStatus(payment: ApiPayment, status: ApiPayment["status"]) {
    const response = await fetch(`/api/dashboard/payments/${payment.payment_id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await response.json().catch(() => null);
    if (!response.ok) { setMessage(updated?.detail ?? "Could not update payment"); return; }
    setPayments((current) => current.map((item) => item.payment_id === payment.payment_id ? updated : item));
    setMessage("Payment status updated.");
  }

  const outstanding = payments.filter((payment) => payment.status === "pending" || payment.status === "overdue").reduce((sum, payment) => sum + payment.amount_pence, 0);
  return <>
    {canManage ? <form className="panel mb-4 grid gap-3 p-5" onSubmit={create}>
      <h2 className="text-base font-medium">Add payment record</h2>
      <div className="grid grid-cols-4 gap-3 max-md:grid-cols-1">
        <select name="player_id" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" required defaultValue=""><option value="" disabled>Player</option>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select>
        <input name="description" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" placeholder="September membership" required />
        <input name="amount" type="number" min="0.01" step="0.01" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" placeholder="Amount (£)" required />
        <input name="due_date" type="date" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" />
      </div>
      <button className="button-primary w-fit rounded-lg px-4 py-2 text-sm" disabled={saving}>{saving ? "Adding…" : "Add payment"}</button>
    </form> : null}
    <section className="overflow-hidden panel">
      <div className="flex items-center justify-between gap-3 border-b border-line p-5"><div><h2 className="text-base font-medium tracking-tight">Payment records</h2><p className="mt-1 text-xs text-muted">£{(outstanding / 100).toFixed(2)} outstanding</p></div><span className="text-xs text-muted">{payments.length} records</span></div>
      {payments.length ? <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-xs"><thead><tr><th className="border-b border-line px-5 py-4 font-medium uppercase tracking-wider text-muted">Player</th><th className="border-b border-line px-5 py-4 font-medium uppercase tracking-wider text-muted">Description</th><th className="border-b border-line px-5 py-4 font-medium uppercase tracking-wider text-muted">Amount</th><th className="border-b border-line px-5 py-4 font-medium uppercase tracking-wider text-muted">Due</th><th className="border-b border-line px-5 py-4 font-medium uppercase tracking-wider text-muted">Status</th>{canManage ? <th className="border-b border-line px-5 py-4 font-medium uppercase tracking-wider text-muted">Action</th> : null}</tr></thead><tbody>{payments.map((payment) => <tr key={payment.payment_id}><td className="border-b border-line px-5 py-4 font-medium">{payment.player_name}</td><td className="border-b border-line px-5 py-4">{payment.description}</td><td className="border-b border-line px-5 py-4">£{(payment.amount_pence / 100).toFixed(2)}</td><td className="border-b border-line px-5 py-4">{payment.due_date ?? "—"}</td><td className="border-b border-line px-5 py-4 capitalize">{payment.status}</td>{canManage ? <td className="border-b border-line px-5 py-4">{payment.status === "paid" ? <button className="text-accent hover:underline" onClick={() => void setStatus(payment, "pending")}>Mark unpaid</button> : <button className="text-accent hover:underline" onClick={() => void setStatus(payment, "paid")}>Mark paid</button>}</td> : null}</tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-muted">No payment records yet.</p>}
      {message ? <p className="border-t border-line p-5 text-xs text-muted" role="status">{message}</p> : null}
    </section>
  </>;
}
