import Link from "next/link";
import { getPublicClub } from "@/lib/public-club";
import Image from "next/image";
import { getAuthenticatedApiUser } from "@/lib/auth";
import { PublicHeroCarousel } from "@/components/public-hero-carousel";
import { NewsletterForm } from "@/components/newsletter-form";
import { headers } from "next/headers";
import { isLandingHost } from "@/lib/club-host";

function formatFixture(date: string) {
  const value = new Date(date);
  return {
    day: value.toLocaleDateString("en-GB", { weekday: "short" }),
    date: value.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    time: value.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

function comparableTeamName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default async function PublicHome({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const scopedPublicClub = requestHeaders.get("x-final-third-public-club-slug");
  if (isLandingHost(host) && !scopedPublicClub) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
        <section className="w-full max-w-3xl">
          <p className="text-xs font-bold tracking-[0.24em] text-accent">FINAL THIRD CLUBHOUSE</p>
          <h1 className="mt-5 max-w-2xl text-5xl font-medium tracking-tight sm:text-7xl">
            Your club,<br /><em className="text-accent">together.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            A shared home for grassroots football clubs, players, families, and volunteers.
            Create your clubhouse and get your club set up in a few minutes.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/login?next=/onboarding" className="button-primary rounded-lg px-5 py-3 text-sm font-medium">
              Create your account <span aria-hidden="true">→</span>
            </Link>
            <Link href="/login" className="text-sm text-accent hover:underline">Already have an account? Sign in</Link>
          </div>
          <p className="mt-16 text-sm text-muted">Your club website and member workspace, in one place.</p>
        </section>
      </main>
    );
  }
  const { club, fixtures, news, teams, leagueStandings, heroSlides } = await getPublicClub();
  const clubPath = scopedPublicClub ? `/${encodeURIComponent(club.slug)}` : "";
  const { edit } = await searchParams;
  const authenticatedUser = await getAuthenticatedApiUser();
  const membership = authenticatedUser?.memberships.find((item) => item.club_id === club.id);
  const now = new Date().getTime();
  const upcomingFixtures = fixtures
    .filter((fixture) => new Date(fixture.date).getTime() > now)
    .sort((first, second) => new Date(first.date).getTime() - new Date(second.date).getTime())
    .slice(0, 3);
  const leadNews = news[0];
  const primaryTeam = teams[0];
  const primaryTeamFixtures = primaryTeam ? fixtures.filter((fixture) => fixture.teamId === primaryTeam.id) : fixtures;
  const nextMatch = primaryTeamFixtures.find((fixture) => new Date(fixture.date).getTime() > now);
  const previousMatch = [...primaryTeamFixtures].filter((fixture) => new Date(fixture.date).getTime() <= now && fixture.homeScore !== null && fixture.awayScore !== null).sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())[0];
  const previousResult = previousMatch
    ? previousMatch.isHome === false
      ? `${previousMatch.awayScore} - ${previousMatch.homeScore}`
      : `${previousMatch.homeScore} - ${previousMatch.awayScore}`
    : "—";
  const currentStandingIndex = primaryTeam
    ? (leagueStandings ?? []).findIndex((standing) => {
        const standingName = comparableTeamName(standing.teamName);
        return [primaryTeam.name, primaryTeam.externalName]
          .filter(Boolean)
          .some((teamName) => {
            const comparableName = comparableTeamName(teamName!);
            return standingName.includes(comparableName) || comparableName.includes(standingName);
          });
      })
    : -1;
  const currentStanding = currentStandingIndex >= 0 ? leagueStandings?.[currentStandingIndex] : undefined;
  const visibleStart = currentStandingIndex >= 0
    ? Math.max(0, Math.min(currentStandingIndex - 2, (leagueStandings ?? []).length - 5))
    : 0;
  const visibleStandings = (leagueStandings ?? []).slice(visibleStart, visibleStart + 5);
  const canEdit = membership?.role === "owner" || membership?.role === "admin";
  const fixtureCards = upcomingFixtures.length ? upcomingFixtures : [{ id: "placeholder", team: "Men's First 11", title: "Upcoming fixture", opposition: "Details coming soon", isHome: true, competition: "League", date: "", venue: "Home ground", homeScore: null, awayScore: null }];
  const homepageNews = news.length ? news.map((item) => ({ ...item, type: "news", postedAt: new Date(item.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) })) : [
    { id: "welcome", title: "Welcome to the club", body: "News, match reports and stories from around the clubhouse.", type: "news", postedAt: "2 days ago", imageUrl: null },
    { id: "matchday", title: "Matchday is more than 90 minutes", body: "Follow the teams, support the players and share the moments that matter.", type: "match report", postedAt: "5 days ago", imageUrl: null },
    { id: "volunteers", title: "Every club runs on people", body: "Meet the volunteers helping make football happen every week.", type: "news", postedAt: "1 week ago", imageUrl: null },
  ];
  return (
    <>
      <PublicHeroCarousel slides={heroSlides} canEdit={canEdit} editMode={edit === "1"} />

      <section className="public-section-heading public-news-heading">
        <div><p className="public-kicker">FROM THE CLUB</p><h2>Latest news</h2></div>
      </section>
      <section className="public-news-grid">
        {homepageNews.slice(0, 3).map((item, index) => <Link href={`${clubPath}/news/${item.id}`} className="public-news-card" key={item.id}>
          <div className={`public-news-image public-news-image-${index + 1}${item.imageUrl ? " public-news-image-with-photo" : ""}`}>
            {item.imageUrl ? <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized sizes="(max-width: 700px) 100vw, 33vw" /> : null}
          </div>
          <div className="public-news-copy">
            <div className="public-news-meta">
              <span className={`public-news-type public-news-type-${item.type === "match report" ? "match-report" : "news"}`}>{item.type}</span>
              <time>{item.postedAt}</time>
            </div>
            <h3>{item.title}</h3>
          </div>
        </Link>)}
      </section>

      <section className="public-club-snapshot" aria-label="Club snapshot">
        <article className="public-snapshot-card public-snapshot-table">
          <div className="public-snapshot-heading"><span>League position</span><strong>{currentStanding ? `${currentStanding.position}${currentStanding.position === 1 ? "st" : currentStanding.position === 2 ? "nd" : currentStanding.position === 3 ? "rd" : "th"}` : "—"}</strong></div>
          <div className="public-standing-columns"><span>Teams</span><span>P</span><span>GD</span><span>Pts</span></div>
          <div className="public-standing-rows">
            {visibleStandings.length ? visibleStandings.map((standing) => <div className={`public-standing-row ${standing === currentStanding ? "is-current" : ""}`} key={standing.id}><span>{standing.position} <strong>{standing.teamName}</strong></span><span>{standing.played}</span><span>{standing.goalDifference}</span><span>{standing.points}</span></div>) : <div className="public-snapshot-empty">League table updates after the next fixture sync.</div>}
          </div>
        </article>
        <article className="public-snapshot-card public-snapshot-match">
          <div className="public-snapshot-match-heading"><div><span>Upcoming match</span><strong>{nextMatch ? formatFixture(nextMatch.date).date : "No fixture"}</strong></div><span className="public-match-badge">{nextMatch?.isHome === false ? "A" : "H"}</span></div>
          <div className="public-snapshot-match-body"><div className="public-snapshot-club-mark">{club.badgeUrl ? <Image src={club.badgeUrl} alt="" width={48} height={48} unoptimized /> : club.name.slice(0, 2).toUpperCase()}</div><div><span>{nextMatch?.team ?? primaryTeam?.name ?? "First team"}</span><strong>{nextMatch?.opposition ?? "Details coming soon"}</strong><small>{nextMatch ? `${formatFixture(nextMatch.date).time} · ${nextMatch.venue}` : ""}</small></div></div>
        </article>
        <article className="public-snapshot-card public-snapshot-match">
          <div className="public-snapshot-match-heading"><div><span>Previous result</span><strong>{previousMatch ? formatFixture(previousMatch.date).date : "No result"}</strong></div><span className="public-match-badge is-result">{previousMatch?.isHome === false ? "A" : "H"}</span></div>
          <div className="public-snapshot-result"><span>{previousMatch?.team ?? primaryTeam?.name ?? "First team"}</span><strong>{previousResult.replace(" - ", " | ")}</strong><span>{previousMatch?.opposition ?? "No result recorded"}</span></div>
        </article>
      </section>

      <section className="public-section-heading">
        <div><p className="public-kicker">NEXT UP</p><h2>On the pitch</h2></div>
      </section>
      <div className="fixture-card-grid">
        {fixtureCards.map((fixture) => {
          const date = fixture.date ? formatFixture(fixture.date) : null;
          return <Link href={`${clubPath}/fixtures`} className="fixture-card" key={fixture.id}>
            <div className="fixture-date"><strong>{date?.day ?? "TBC"}</strong><span>{date?.date ?? "Date to follow"}</span></div>
            <span className="fixture-team-label">{fixture.team}</span>
            <strong>{fixture.title}</strong>
            <span className="fixture-card-opposition">{fixture.opposition ?? "Opposition TBC"}</span>
            <span className="fixture-card-meta">{date?.time ?? "Time TBC"} · {fixture.venue}</span>
          </Link>;
        })}
      </div>

      <section className="public-newsletter">
        <div className="public-newsletter-copy">
          <p className="public-kicker">STAY CLOSE TO THE CLUB</p>
          <h2>News, fixtures<br /><em>and the good stuff.</em></h2>
          <p>Get the latest from {club.name}, straight to your inbox. No noise, just the moments that matter.</p>
          <NewsletterForm clubId={club.id} />
        </div>
        <div className="public-newsletter-art">
          <div className="hero-orbit hero-orbit-one"></div>
          <div className="hero-orbit hero-orbit-two"></div>
          {club.badgeUrl ? <Image src={club.badgeUrl} alt="" width={190} height={190} className="hero-badge" unoptimized /> : <span className="hero-initials">{club.name.split(" ").map((word) => word[0]).join("")}</span>}
          <span className="hero-stamp">ONE<br />CLUB</span>
        </div>
      </section>

      <section className="public-lower-grid">
        {leadNews ? <Link href={`${clubPath}/news/${leadNews.id}`} className="news-feature"><p className="public-kicker">LATEST NEWS</p><h2>{leadNews.title}</h2><p>{leadNews.body}</p><span className="text-link">Read the story →</span></Link> : <Link href={`${clubPath}/contact`} className="news-feature"><p className="public-kicker">WELCOME TO THE CLUB</p><h2>Find your place at {club.name}</h2><p>Follow the team, keep up with fixtures, and get in touch with the club.</p><span className="text-link">Get in touch →</span></Link>}
        <div className="club-links">
          <Link href={`${clubPath}/teams`}><span>01</span><div><strong>Meet the teams</strong><small>{teams.length} teams, one community</small></div><b>↗</b></Link>
          <Link href={`${clubPath}/contact`}><span>02</span><div><strong>Get involved</strong><small>Find your place at the club</small></div><b>↗</b></Link>
        </div>
      </section>
    </>
  );
}
