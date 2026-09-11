import { PageHeading } from "@/components/page-ui";
import { getPublicClub } from "@/lib/public-club";
import { PublicNewsList } from "@/components/public-news-list";
import { ArticleSettings } from "@/components/article-settings";
import { getAuthenticatedApiUser } from "@/lib/auth";

export const metadata = { title: "News" };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { club, news } = await getPublicClub();
  const authenticatedUser = await getAuthenticatedApiUser();
  const membership = authenticatedUser?.memberships.find((item) => item.club_id === club.id);
  const canEdit = membership?.role === "owner" || membership?.role === "admin";
  const { edit } = await searchParams;
  return (
    <>
      <PageHeading
        eyebrow="AROUND THE CLUB"
        title="Club news"
        description="Stories and announcements from our football community."
      />
      {canEdit && edit === "1" ? <ArticleSettings /> : <PublicNewsList news={news} />}
    </>
  );
}
