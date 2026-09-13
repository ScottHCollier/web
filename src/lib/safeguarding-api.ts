import "server-only";
import { cookies } from "next/headers";
import { authCookieName } from "@/lib/auth";
import { getDashboardClubId } from "@/lib/dashboard-club";
const api = process.env.API_URL ?? "http://localhost:8000";
export type SafeguardingData = { contact_name: string | null; contact_email: string | null; contact_phone: string | null; documents: Array<{ document_id: string; title: string; category: string; original_filename: string; download_url: string; is_public: boolean }> };
const clubId = getDashboardClubId;
async function request<T>(path: string, init: RequestInit = {}) { const token = (await cookies()).get(authCookieName())?.value; const response = await fetch(`${api}${path}`, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token ?? ""}`, ...init.headers }, cache: "no-store" }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.detail ?? "Safeguarding request failed"); return body as T; }
export function getSafeguardingSettings() { return clubId().then((id) => request<SafeguardingData>(`/api/v1/clubs/${id}/safeguarding`)); }
export async function updateSafeguardingSettings(input: unknown) { return request<SafeguardingData>(`/api/v1/clubs/${await clubId()}/safeguarding`, { method: "PATCH", body: JSON.stringify(input) }); }
