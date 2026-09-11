import { getCurrentClub } from "@/lib/current-club";
import { PageHeading } from "@/components/page-ui";
import { Status } from "@/components/page-ui";

export default async function Page() {
  const data = await getCurrentClub();
  return (
    <>
      <PageHeading
        title="Club feed"
        description="The latest news, useful reminders, and moments that bring your club together."
      />
      <div className="grid gap-4">
        {data.posts.map((post) => (
          <article className="panel p-6" key={post.id}>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground">{post.author[0]}</span>
              <div>
                <strong>{post.author}</strong>
                <span className="mt-1 block text-xs text-muted">{data.club.name}</span>
              </div>
              <Status>Club update</Status>
            </div>
            <h2 className="text-base font-medium tracking-tight">{post.title}</h2>
            <p className="mt-3 text-sm leading-loose">{post.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}
