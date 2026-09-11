import type { Club, ClubData } from "@/types/club";
import { getClubTheme } from "./club-themes.ts";

// Fictional fixtures only. Replace this repository with authenticated database queries.
export const demoClubs: Club[] = [
  {
    id: "montpellier-fc",
    name: "Montpellier FC",
    slug: "montpellier-fc",
    badgeUrl: "/badge.png",
    heroImageUrl: null,
    heroDisplayMode: "current",
    theme: getClubTheme("montpellier-fc"),
  },
  {
    id: "club-oakwood",
    name: "Oakwood United",
    slug: "oakwood-united",
    badgeUrl: null,
    heroImageUrl: null,
    heroDisplayMode: "current",
    theme: getClubTheme("club-oakwood"),
  },
];

const records: ClubData[] = demoClubs.map((club, index) => ({
  club,
  players: (index === 0
    ? [
        "Alex Morgan",
        "Jamie Taylor",
        "Sam Edwards",
        "Charlie Green",
        "Riley Brooks",
        "Jordan Ellis",
      ]
    : ["Casey Wood", "Drew Hughes", "Taylor Bell", "Robin Clarke"]
  ).map((name, i) => ({
    id: `${club.id}-player-${i}`,
    clubId: club.id,
    name,
    team: "Men's First 11",
    registration: i % 3 === 0 ? "Pending" : "Complete",
    guardianEmails: index === 0 && i === 0 ? ["jordan@example.com"] : [],
  })),
  fixtures: [
    {
      id: `${club.id}-fixture-1`,
      clubId: club.id,
      title: `Training at ${index === 0 ? "Riverside" : "Oakwood"}`,
      date: "2026-09-10T18:00:00+01:00",
      venue:
        index === 0 ? "Riverside Recreation Ground" : "Oakwood Playing Fields",
      team: "Men's First 11",
    },
    {
      id: `${club.id}-fixture-2`,
      clubId: club.id,
      title: index === 0 ? "vs. Meadow Athletic" : "vs. Hillcrest Rovers",
      date: "2026-09-12T10:30:00+01:00",
      venue:
        index === 0 ? "Riverside Recreation Ground" : "Oakwood Playing Fields",
      team: "Men's First 11",
    },
  ],
  posts: [
    {
      id: `${club.id}-post-1`,
      clubId: club.id,
      title: "A new season starts here",
      body: `Welcome back to ${club.name}. Please check your player registration and let your coach know your availability before the weekend.`,
      author: "Club committee",
    },
    {
      id: `${club.id}-post-2`,
      clubId: club.id,
      title: "A little help on matchday",
      body: "We’re looking for volunteers to help set up the pitches and run refreshments. Speak to your team coach if you can lend a hand.",
      author: "Volunteer coordinator",
    },
  ],
  payments: [
    {
      id: `${club.id}-payment-1`,
      clubId: club.id,
      description: "September membership",
      amount: index === 0 ? 25 : 30,
      status: "Outstanding",
    },
    {
      id: `${club.id}-payment-2`,
      clubId: club.id,
      description: "Season registration",
      amount: index === 0 ? 40 : 45,
      status: "Paid",
    },
  ],
  documents: [
    {
      id: `${club.id}-document-1`,
      clubId: club.id,
      title: "Club handbook",
      category: "Club information",
    },
    {
      id: `${club.id}-document-2`,
      clubId: club.id,
      title: "Player and parent code of conduct",
      category: "Policies",
    },
    {
      id: `${club.id}-document-3`,
      clubId: club.id,
      title: "Safeguarding policy",
      category: "Safeguarding",
    },
  ],
}));

export function findClubData(
  clubId: string,
  membershipClubIds: readonly string[],
): ClubData | undefined {
  // Resolve membership before returning any tenant records. A domain lookup alone grants no access.
  return records.find(
    ({ club }) => club.id === clubId && membershipClubIds.includes(club.id),
  );
}

// Explicit public projection: do not return member records or the internal club feed.
export function findPublicClubData(clubId: string) {
  const data = records.find(({ club }) => club.id === clubId);
  if (!data) return undefined;
  return {
    club: data.club,
    teams: ["Men's First 11"].map((name) => ({
      id: `${clubId}-${name.toLowerCase().replaceAll(" ", "-")}`,
      name,
      description: `Grassroots football with ${data.club.name}.`,
    })),
    fixtures: data.fixtures.map(({ id, title, date, venue, team }) => ({
      id, title, date, venue, team,
    })),
    news: [{
      id: `${clubId}-welcome`,
      title: `Welcome to ${data.club.name}`,
      body: "A new season of grassroots football is here. Follow our teams, find upcoming fixtures, and keep up with the latest club news.",
    }],
  };
}
