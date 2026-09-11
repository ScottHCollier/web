"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type NewsItem = { id: string; title: string; body: string; imageUrl: string | null; publishedAt: string };

export function PublicNewsList({ news }: { news: NewsItem[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(news.length / pageSize));
  const visibleNews = news.slice((page - 1) * pageSize, page * pageSize);

  if (!news.length) return <div className="panel p-10 text-center"><h2 className="text-base font-medium">No news yet</h2><p className="mt-2 text-sm text-muted">Check back soon for the latest from the club.</p></div>;

  return <div className="grid gap-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleNews.map((post) => <Link href={`/news/${post.id}`} key={post.id} className="public-news-card"><div className={`public-news-image public-news-image-1 relative aspect-video bg-accent-soft${post.imageUrl ? " public-news-image-with-photo" : ""}`}>{post.imageUrl ? <Image src={post.imageUrl} alt="" fill className="object-cover" unoptimized /> : null}</div><div className="public-news-copy"><div className="public-news-meta"><span className="public-news-type public-news-type-news">News</span><time>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</time></div><h2>{post.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.body}</p></div></Link>)}</div>
    {pageCount > 1 ? <nav className="flex items-center justify-between" aria-label="News pagination"><button type="button" disabled={page === 1} className="rounded-lg border border-line px-3 py-2 text-sm text-muted disabled:opacity-40" onClick={() => setPage((current) => current - 1)}>← Previous</button><span className="text-sm text-muted">Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} className="rounded-lg border border-line px-3 py-2 text-sm text-muted disabled:opacity-40" onClick={() => setPage((current) => current + 1)}>Next →</button></nav> : null}
  </div>;
}
