import "server-only";
import { cookies, headers } from "next/headers";
import { authCookieName } from "@/lib/auth";

const api = process.env.API_URL ?? "http://localhost:8000";
async function clubId() { const host = (await headers()).get("host")?.replace(/:\d+$/, "") ?? ""; const response = await fetch(`${api}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(host)}`, { cache: "no-store" }); if (!response.ok) throw new Error("Club not found"); return (await response.json()).club_id as string; }
async function request<T>(path: string, init: RequestInit) { const token = (await cookies()).get(authCookieName())?.value; const response = await fetch(`${api}${path}`, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}` } }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.detail ?? "Team request failed"); return body as T; }
export async function createTeam(input: unknown) { return request(`/api/v1/clubs/${await clubId()}/teams`, { method: "POST", body: JSON.stringify(input) }); }
export async function updateTeam(teamId: string, input: unknown) { return request(`/api/v1/clubs/${await clubId()}/teams/${teamId}`, { method: "PUT", body: JSON.stringify(input) }); }
export async function removeTeam(teamId: string) { return request(`/api/v1/clubs/${await clubId()}/teams/${teamId}`, { method: "DELETE" }); }
