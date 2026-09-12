import "server-only";

import { cookies } from "next/headers";
import type { AuthUser, ClubRole, ClubMembership } from "@/types/club";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";
const accessTokenCookie = "final-third-access-token";

type ApiUser = {
  user_id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  memberships: { club_id: string; club_slug: string; role: ClubRole }[];
};
export type AuthResult = { access_token: string; expires_in: number; user: ApiUser };

export function authCookieName() { return accessTokenCookie; }

export async function authenticate(path: "login" | "register", email: string, password: string) {
  try {
    const response = await fetch(`${apiOrigin}/api/v1/auth/${path}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }), cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return { error: payload?.detail ?? "Authentication failed", status: response.status };
    return { result: payload as AuthResult };
  } catch (error) {
    console.error("Authentication API request failed", {
      apiOrigin,
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "The authentication service is unavailable." };
  }
}

export async function getAuthenticatedApiUser(): Promise<ApiUser | null> {
  const token = (await cookies()).get(accessTokenCookie)?.value;
  if (!token) return null;
  try {
    const response = await fetch(`${apiOrigin}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${token}` }, cache: "no-store",
    });
    return response.ok ? ((await response.json()) as ApiUser) : null;
  } catch { return null; }
}

export function toDashboardUser(apiUser: ApiUser): AuthUser {
  const memberships: ClubMembership[] = apiUser.memberships.map((membership) => ({
    clubId: membership.club_id,
    role: membership.role,
  }));
  return {
    id: apiUser.user_id,
    name: apiUser.email.split("@")[0],
    email: apiUser.email,
    memberships,
  };
}
