"use client";

import { useState } from "react";
import type { ApiDocument } from "@/lib/document-api";

export function DocumentLibrary({ initialDocuments, canManage }: { initialDocuments: ApiDocument[]; canManage: boolean }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const response = await fetch("/api/dashboard/documents", { method: "POST", body: new FormData(event.currentTarget) });
    const document = await response.json().catch(() => null); setSaving(false);
    if (!response.ok) { setMessage(document?.detail ?? "Could not upload document"); return; }
    setDocuments((current) => [document, ...current]); setMessage("Document uploaded."); event.currentTarget.reset();
  }

  async function remove(document: ApiDocument) {
    if (!window.confirm(`Delete ${document.title}?`)) return;
    const response = await fetch(`/api/dashboard/documents/${document.document_id}`, { method: "DELETE" });
    if (!response.ok) { setMessage("Could not delete document"); return; }
    setDocuments((current) => current.filter((item) => item.document_id !== document.document_id)); setMessage("Document deleted.");
  }

  return <>
    {canManage ? <form className="panel mb-4 grid gap-3 p-5" onSubmit={upload}>
      <h2 className="text-base font-medium">Upload document</h2>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <input name="title" placeholder="Document title" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" required />
        <input name="category" placeholder="Category, e.g. Safeguarding" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" required />
        <input name="document" type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.txt" className="rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" required />
      </div>
      <label className="flex items-center gap-2 text-sm"><input name="is_public" type="checkbox" /> Publish on public safeguarding page</label>
      <button className="button-primary w-fit rounded-lg px-4 py-2 text-sm" disabled={saving}>{saving ? "Uploading…" : "Upload document"}</button>
    </form> : null}
    <section className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
      {documents.map((document) => <article className="panel p-6" key={document.document_id}>
        <span className="mb-6 grid h-12 w-10 place-items-center rounded-lg bg-secondary text-2xl text-secondary-foreground" aria-hidden="true">▤</span>
        <p className="mb-2 text-xs font-medium tracking-widest text-muted">{document.category}</p>
        <h2 className="text-base font-medium tracking-tight">{document.title}</h2>
        <p className="my-2.5 truncate text-xs text-muted" title={document.original_filename}>{document.original_filename}</p>
        <p className="mb-3 text-xs text-muted">{document.is_public ? "Public safeguarding document" : "Private club document"}</p>
        <div className="flex items-center gap-3"><a href={document.download_url} className="text-xs text-accent hover:underline">Download</a>{canManage ? <button className="text-xs text-danger hover:underline" onClick={() => void remove(document)}>Delete</button> : null}</div>
      </article>)}
      {documents.length === 0 ? <p className="panel col-span-full p-8 text-center text-sm text-muted">No documents have been uploaded yet.</p> : null}
    </section>
    {message ? <p className="mt-4 text-xs text-muted" role="status">{message}</p> : null}
  </>;
}
