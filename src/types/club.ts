import type { ClubTheme } from "@/lib/club-themes";

export type Club = {
  id: string;
  name: string;
  slug: string;
  badgeUrl: string | null;
  heroImageUrl: string | null;
  heroDisplayMode: "current" | "image";
  theme: ClubTheme;
};

export type ClubRole = "owner" | "admin" | "coach" | "member";

export type ClubMembership = {
  clubId: string;
  role: ClubRole;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  memberships: ClubMembership[];
};

export type Player = {
  id: string;
  clubId: string;
  name: string;
  team: string;
  position?: string | null;
  dateOfBirth?: string | null;
  autoRenewNextSeason?: boolean;
  homegrownPlayer?: boolean;
  notes?: string | null;
  registration: "Complete" | "Pending" | "Invited";
  guardianEmails?: string[];
};

export type ClubData = {
  club: Club;
  teams?: { id: string; name: string }[];
  players: Player[];
  fixtures: {
    id: string;
    clubId: string;
    title: string;
    opposition?: string | null;
    isHome?: boolean | null;
    competition?: string | null;
    date: string;
    venue: string;
    team: string;
  }[];
  posts: {
    id: string;
    clubId: string;
    title: string;
    body: string;
    author: string;
  }[];
  payments: {
    id: string;
    clubId: string;
    description: string;
    amount: number;
    status: "Paid" | "Outstanding" | "Cancelled";
  }[];
  documents: { id: string; clubId: string; title: string; category: string }[];
};
