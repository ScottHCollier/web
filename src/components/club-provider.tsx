"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Club } from "@/types/club";

const ClubContext = createContext<Club | null>(null);

export function ClubProvider({
  club,
  children,
}: {
  club: Club;
  children: ReactNode;
}) {
  return <ClubContext.Provider value={club}>{children}</ClubContext.Provider>;
}

export function useClub() {
  const club = useContext(ClubContext);
  if (!club) throw new Error("useClub must be used within a ClubProvider");
  return club;
}
