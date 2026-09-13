import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicClub } from "@/lib/public-club";

export async function generateMetadata({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  const { news } = await getPublicClub();
  const article = news.find((item) => item.id === articleId);
  return article ? { title: `${article.title} | Club news` } : { title: "Club news" };
}

export default async function ArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  const { club, news } = await getPublicClub();
  const article = news.find((item) => item.id === articleId);
  if (!article) notFound();
  return <article className="mx-auto max-w-4xl">
    <Link href={`/clubs/${encodeURIComponent(club.slug)}/news`} className="text-sm text-muted hover:text-accent">← Back to club news</Link>
    <div className="mt-6 overflow-hidden rounded-2xl bg-surface-muted">{article.imageUrl ? <div className="public-article-image public-news-image-with-photo"><Image src={article.imageUrl} alt="" width={1400} height={700} className="max-h-[32rem] w-full object-cover" unoptimized /></div> : <div className="h-40 bg-gradient-to-br from-primary to-accent sm:h-64" />}<div className="p-6 sm:p-10"><p className="public-kicker">CLUB NEWS · {new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) }</p><h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-5xl">{article.title}</h1><p className="mt-8 whitespace-pre-wrap text-base leading-8 text-muted sm:text-lg">{article.body}</p></div></div>
  </article>;
}
