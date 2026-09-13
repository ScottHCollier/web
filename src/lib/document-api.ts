import "server-only";
import { cookies } from "next/headers";
import { authCookieName } from "@/lib/auth";
import { getDashboardClubId } from "@/lib/dashboard-club";

const api = process.env.API_URL ?? "http://localhost:8000";
export type ApiDocument = { document_id: string; club_id: string; player_id: string | null; is_public: boolean; title: string; category: string; original_filename: string; mime_type: string; size_bytes: number; created_at: string; download_url: string };
async function request<T>(path: string, init: RequestInit = {}) { const token = (await cookies()).get(authCookieName())?.value; const response = await fetch(`${api}${path}`, { ...init, headers: { ...(init.body instanceof FormData ? {} : { "content-type": "application/json" }), authorization: `Bearer ${token ?? ""}`, ...init.headers }, cache: "no-store" }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.detail ?? "Document request failed"); return body as T; }
export async function listDocuments() { return request<ApiDocument[]>(`/api/v1/clubs/${await getDashboardClubId()}/documents`); }
export async function uploadDocument(form: FormData) { return request<ApiDocument>(`/api/v1/clubs/${await getDashboardClubId()}/documents?title=${encodeURIComponent(String(form.get("title") ?? ""))}&category=${encodeURIComponent(String(form.get("category") ?? ""))}&is_public=${form.get("is_public") === "on"}`, { method: "POST", body: form }); }
export async function deleteDocument(documentId: string) { return request<void>(`/api/v1/clubs/${await getDashboardClubId()}/documents/${documentId}`, { method: "DELETE" }); }
