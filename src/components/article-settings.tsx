"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { LibraryImage } from "@/components/image-library";

type Article = { article_id: string; image_id: string | null; image_url: string | null; title: string; body: string; status: "draft" | "published" | "scheduled"; scheduled_at: string | null; published_at: string };

export function ArticleSettings() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageId, setImageId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [screen, setScreen] = useState<"list" | "add">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<Article["status"]>("published");
  const [scheduledAt, setScheduledAt] = useState("");
  const [preview, setPreview] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  async function load() {
    const [articleResponse, imageResponse] = await Promise.all([fetch("/api/dashboard/articles", { cache: "no-store" }), fetch("/api/dashboard/images", { cache: "no-store" })]);
    if (articleResponse.ok) setArticles(await articleResponse.json() as Article[]);
    if (imageResponse.ok) setImages(await imageResponse.json() as LibraryImage[]);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function publish(event: React.FormEvent) {
    event.preventDefault(); setMessage(null);
    const response = await fetch(editingId ? `/api/dashboard/articles/${editingId}` : "/api/dashboard/articles", { method: editingId ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, body, image_id: imageId || null, status, scheduled_at: status === "scheduled" ? new Date(scheduledAt).toISOString() : null }) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { setMessage(payload?.detail ?? "Could not publish article."); return; }
    setTitle(""); setBody(""); setImageId(""); setEditingId(null); setStatus("published"); setScheduledAt(""); setPreview(false); setMessage(editingId ? "Article updated." : status === "draft" ? "Draft saved." : "Article published."); setPage(1); setScreen("list"); await load();
  }

  async function remove(article: Article) {
    if (!window.confirm(`Delete “${article.title}”?`)) return;
    const response = await fetch(`/api/dashboard/articles/${article.article_id}`, { method: "DELETE" });
    if (response.ok) { setArticles((current) => current.filter((item) => item.article_id !== article.article_id)); setMessage("Article deleted."); }
  }

  function edit(article: Article) {
    setTitle(article.title); setBody(article.body); setImageId(article.image_id ?? ""); setStatus(article.status); setScheduledAt(article.scheduled_at ? new Date(article.scheduled_at).toISOString().slice(0, 16) : ""); setEditingId(article.article_id); setMessage(null); setPreview(false); setScreen("add");
  }

  if (screen === "add") return <section className="grid gap-4" aria-labelledby="new-article-title">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><button type="button" className="mb-3 text-sm text-muted hover:text-accent" onClick={() => setScreen("list")}>← Back to articles</button><h2 id="new-article-title" className="text-xl font-medium">Add article</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Publish a story for your public club site. The three newest articles appear in Latest news.</p></div></div>
    {preview ? <div className="panel p-6"><p className="public-kicker">ARTICLE PREVIEW</p><h2 className="mt-3 text-3xl font-medium">{title || "Untitled article"}</h2><p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-muted">{body || "Your article body will appear here."}</p><button type="button" className="mt-5 rounded-lg border border-line px-4 py-2 text-sm" onClick={() => setPreview(false)}>Back to editor</button></div> : <form className="panel grid gap-4 p-6" onSubmit={(event) => void publish(event)}>
      <label className="grid gap-1.5 text-sm font-medium">Title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" placeholder="Give your story a headline" /></label>
      <label className="grid gap-1.5 text-sm font-medium">Body<textarea required rows={6} value={body} onChange={(event) => setBody(event.target.value)} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" placeholder="Write your article…" /></label>
      <label className="grid gap-1.5 text-sm font-medium">Publishing<select value={status} onChange={(event) => setStatus(event.target.value as Article["status"])} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal"><option value="published">Publish now</option><option value="draft">Save as draft</option><option value="scheduled">Schedule publication</option></select></label>
      {status === "scheduled" ? <label className="grid gap-1.5 text-sm font-medium">Publish date and time<input required type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="rounded-lg border border-line bg-surface-muted px-3 py-2 font-normal" /></label> : null}
      <fieldset className="grid gap-2"><legend className="text-sm font-medium">Hero image <span className="ml-1 text-xs font-normal text-muted">Choose from your media library.</span></legend><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{images.map((image) => <button key={image.image_id} type="button" className={`overflow-hidden rounded-xl border text-left ${imageId === image.image_id ? "border-accent ring-2 ring-accent" : "border-line hover:border-accent"}`} onClick={() => setImageId(imageId === image.image_id ? "" : image.image_id)} aria-pressed={imageId === image.image_id}>{image.url ? <Image src={image.url} alt="" width={320} height={180} className="aspect-video w-full object-cover" unoptimized /> : <div className="aspect-video bg-accent-soft" />}<span className="block truncate px-3 py-2 text-xs text-muted">{image.filename ?? "Untitled image"}</span></button>)}</div>{!images.length ? <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No images yet. Add one from the Media section in Club Admin.</p> : null}</fieldset>
      <div className="flex flex-wrap gap-2"><button type="submit" className="button-primary rounded-lg px-4 py-2 text-sm">{editingId ? "Save changes" : status === "draft" ? "Save draft" : status === "scheduled" ? "Schedule article" : "Publish article"}</button><button type="button" className="rounded-lg border border-line px-4 py-2 text-sm" onClick={() => setPreview(true)}>Preview</button></div>
    </form>}
    {message ? <p className="mt-4 text-sm text-muted" role="status">{message}</p> : null}
  </section>;

  const pageCount = Math.max(1, Math.ceil(articles.length / pageSize));
  const visibleArticles = articles.slice((page - 1) * pageSize, page * pageSize);
  return <section className="grid gap-4" aria-labelledby="articles-title">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="articles-title" className="text-xl font-medium">Articles</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Publish stories for your public club site. The three newest articles appear in Latest news.</p></div><button type="button" className="button-primary rounded-lg px-4 py-2 text-sm" onClick={() => { setMessage(null); setScreen("add"); }}>Add article</button></div>
    {visibleArticles.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleArticles.map((article) => <article key={article.article_id} className="overflow-hidden rounded-xl border border-line bg-surface"><div className="relative aspect-video bg-accent-soft">{article.image_url ? <Image src={article.image_url} alt="" fill className="object-cover" unoptimized /> : null}</div><div className="grid gap-3 p-4"><div><p className="text-xs uppercase tracking-wider text-muted">{article.status === "draft" ? "Draft" : article.status === "scheduled" ? `Scheduled ${article.scheduled_at ? new Date(article.scheduled_at).toLocaleDateString("en-GB") : ""}` : new Date(article.published_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p><h3 className="mt-2 line-clamp-2 text-base font-medium">{article.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{article.body}</p></div><div className="flex gap-3"><button type="button" onClick={() => edit(article)} className="text-xs text-accent hover:underline">Edit article</button><button type="button" onClick={() => void remove(article)} className="text-xs text-danger hover:underline">Delete article</button></div></div></article>)}</div> : <div className="panel p-10 text-center"><h3 className="text-base font-medium">No articles yet</h3><p className="mt-2 text-sm text-muted">Add your first club story to start filling the news section.</p></div>}
    {pageCount > 1 ? <nav className="flex items-center justify-between" aria-label="Articles pagination"><button type="button" disabled={page === 1} className="rounded-lg border border-line px-3 py-2 text-sm text-muted disabled:opacity-40" onClick={() => setPage((current) => current - 1)}>← Previous</button><span className="text-sm text-muted">Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} className="rounded-lg border border-line px-3 py-2 text-sm text-muted disabled:opacity-40" onClick={() => setPage((current) => current + 1)}>Next →</button></nav> : null}
    {message ? <p className="text-sm text-muted" role="status">{message}</p> : null}
  </section>;
}
