"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublicContactEditor({ initial }: { initial: { contactEmail: string | null; contactPhone: string | null; contactAddress: string | null; contactDescription: string | null; instagramUrl: string | null; facebookUrl: string | null } }) {
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/dashboard/contact", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), phone: form.get("phone"), address: form.get("address"), description: form.get("description"), instagram_url: form.get("instagram_url"), facebook_url: form.get("facebook_url") }) });
    const payload = await response.json().catch(() => null); setSaving(false);
    setMessage(response.ok ? "Contact details saved." : payload?.detail ?? "Could not save contact details.");
    if (response.ok) router.refresh();
  }
  return <form className="panel grid gap-4 p-6" onSubmit={save}><div><h2 className="text-lg font-medium">Edit club profile</h2><p className="mt-2 text-sm leading-relaxed text-muted">These details are shown to visitors on this page.</p></div><label className="grid gap-1.5 text-sm font-medium">About the club<textarea name="description" rows={4} defaultValue={initial.contactDescription ?? ""} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" placeholder="A short introduction to your club" /></label><label className="grid gap-1.5 text-sm font-medium">Email<input name="email" type="email" defaultValue={initial.contactEmail ?? ""} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" /></label><label className="grid gap-1.5 text-sm font-medium">Phone<input name="phone" defaultValue={initial.contactPhone ?? ""} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" /></label><label className="grid gap-1.5 text-sm font-medium">Address<textarea name="address" rows={3} defaultValue={initial.contactAddress ?? ""} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" /></label><label className="grid gap-1.5 text-sm font-medium">Instagram URL<input name="instagram_url" type="url" defaultValue={initial.instagramUrl ?? ""} placeholder="https://instagram.com/yourclub" className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" /></label><label className="grid gap-1.5 text-sm font-medium">Facebook URL<input name="facebook_url" type="url" defaultValue={initial.facebookUrl ?? ""} placeholder="https://facebook.com/yourclub" className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" /></label><button className="button-primary w-fit rounded-lg px-4 py-2 text-sm" disabled={saving}>{saving ? "Saving…" : "Save club profile"}</button>{message ? <p className="text-sm text-muted" role="status">{message}</p> : null}</form>;
}
