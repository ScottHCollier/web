import "server-only";
import { cookies } from "next/headers";
import { authCookieName } from "@/lib/auth";
import { getDashboardClubId } from "@/lib/dashboard-club";

const api = process.env.API_URL ?? "http://localhost:8000";
async function request<T>(path: string, init: RequestInit) { const token = (await cookies()).get(authCookieName())?.value; const response = await fetch(`${api}${path}`, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` } }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.detail ?? "Team request failed"); return body as T; }
export async function createTeam(input: unknown) { return request(`/api/v1/clubs/${await getDashboardClubId()}/teams`, { method: "POST", body: JSON.stringify(input) }); }
export async function updateTeam(teamId: string, input: unknown) { return request(`/api/v1/clubs/${await getDashboardClubId()}/teams/${teamId}`, { method: "PUT", body: JSON.stringify(input) }); }
export async function removeTeam(teamId: string) { return request(`/api/v1/clubs/${await getDashboardClubId()}/teams/${teamId}`, { method: "DELETE" }); }
