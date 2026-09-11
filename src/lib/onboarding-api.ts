import "server-only";

import { cookies } from "next/headers";
import { authCookieName } from "@/lib/auth";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get(authCookieName())?.value;
  const response = await fetch(`${apiOrigin}${path}`, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}`, ...init.headers },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.detail ?? "Onboarding request failed");
  return payload as T;
}

export type OnboardingClub = { club_id: string; name: string; slug: string; badge_url: string | null };

export function createOnboardingClub(input: { name: string; slug: string }) {
  return request<OnboardingClub>("/api/v1/clubs", { method: "POST", body: JSON.stringify(input) });
}

export function createOnboardingTeam(clubId: string, input: { name: string; external_provider?: string; external_id?: string; external_league_id?: string; external_name?: string; external_url?: string }) {
  return request(`/api/v1/clubs/${clubId}/teams`, { method: "POST", body: JSON.stringify(input) });
}
