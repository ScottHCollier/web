import { Fragment } from "react";

type Fixture = {
  id: string;
  title: string;
  competition?: string | null;
  date: string;
  venue: string;
  team: string;
  opposition?: string | null;
  isHome?: boolean | null;
  homeScore?: number | null;
  awayScore?: number | null;
};

function normalizedTeamName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/first$/, "");
}

function isTeam(side: string, team: string) {
  const normalizedSide = normalizedTeamName(side);
  const normalizedTeam = normalizedTeamName(team);
  return normalizedSide === normalizedTeam
    || normalizedSide.includes(normalizedTeam)
    || normalizedTeam.includes(normalizedSide);
}

function fixtureDetails(fixture: Fixture) {
  if (fixture.opposition && fixture.isHome != null) {
    return {
      opposition: fixture.opposition,
      homeAway: fixture.isHome ? "H" as const : "A" as const,
      home: fixture.isHome,
    };
  }
  const sides = fixture.title.split(/\s+vs\.?\s+/i).map((side) => side.trim());
  if (sides.length === 2) {
    const [home, away] = sides;
    if (isTeam(home, fixture.team)) {
      return { opposition: away, homeAway: "H" as const, home: true };
    }
    if (isTeam(away, fixture.team)) {
      return { opposition: home, homeAway: "A" as const, home: false };
    }
  }
  return {
    opposition: fixture.title.replace(/^vs\.?\s*/i, "").trim(),
    homeAway: "—" as const,
    home: null,
  };
}

export function FixtureList({ fixtures }: { fixtures: Fixture[] }) {
  if (!fixtures.length)
    return <p className="panel p-6 text-muted">No fixtures announced yet.</p>;
  const months = new Map<string, Fixture[]>();
  for (const fixture of fixtures) {
    const month = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
      timeZone: "Europe/London",
    }).format(new Date(fixture.date));
    months.set(month, [...(months.get(month) ?? []), fixture]);
  }
  return (
    <section className="overflow-hidden panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-xs">
          <thead className="bg-surface-muted text-[10px] uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Competition</th><th className="min-w-48 px-4 py-3">Opposition</th><th className="w-20 px-4 py-3">H/A</th><th className="px-4 py-3">Venue</th><th className="px-4 py-3">Result</th></tr>
          </thead>
          <tbody>
            {[...months].map(([month, monthFixtures]) => (
              <Fragment key={month}>{/* Month bands keep the list scannable without a TV column. */}
                <tr key={`${month}-heading`}><th colSpan={7} className="bg-accent-soft px-4 py-3 text-left text-[10px] uppercase tracking-widest text-accent">{month}</th></tr>
                {monthFixtures.map((fixture) => {
                  const details = fixtureDetails(fixture);
                  const hasScore = fixture.homeScore != null || fixture.awayScore != null;
                  const result = hasScore
                    ? `${fixture.homeScore ?? "?"} - ${fixture.awayScore ?? "?"}`
                    : "—";
                  const outcome = fixture.homeScore == null || fixture.awayScore == null || details.home === null
                    ? null
                    : fixture.homeScore === fixture.awayScore
                      ? "draw"
                      : (details.home ? fixture.homeScore > fixture.awayScore : fixture.awayScore > fixture.homeScore)
                        ? "win"
                        : "loss";
                  const resultStyle = outcome === "win"
                    ? "bg-success text-success-foreground"
                    : outcome === "loss"
                      ? "bg-danger text-danger-foreground"
                      : outcome === "draw"
                        ? "bg-warning text-warning-foreground"
                        : "bg-surface-muted text-muted";
                  return <tr key={fixture.id} className="border-t border-line hover:bg-surface-muted">
                    <td className="px-4 py-3"><time dateTime={fixture.date}>{new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "numeric", year: "numeric", timeZone: "Europe/London" }).format(new Date(fixture.date))}</time></td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(new Date(fixture.date))}</td>
                    <td className="px-4 py-3 text-muted">{fixture.competition ?? "—"}</td>
                    <td className="px-4 py-3"><div className="grid gap-1"><strong>{details.opposition}</strong><span className="text-[10px] uppercase tracking-wider text-muted">{fixture.team}</span></div></td>
                    <td className="px-4 py-3 font-semibold">{details.homeAway}</td>
                    <td className="px-4 py-3 text-muted">{fixture.venue}</td>
                    <td className="px-4 py-3"><span className={`inline-block rounded-md px-2 py-1 font-semibold ${resultStyle}`}>{result}</span></td>
                  </tr>;
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
