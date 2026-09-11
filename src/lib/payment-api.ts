import "server-only";

import { cookies, headers } from "next/headers";
import { authCookieName } from "@/lib/auth";

const api = process.env.API_URL ?? "http://localhost:8000";

export type ApiPayment = {
  payment_id: string;
  club_id: string;
  player_id: string;
  player_name: string;
  description: string;
  amount_pence: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

async function clubId() {
  const host = (await headers()).get("host")?.replace(/:\d+$/, "") ?? "";
  const response = await fetch(
    `${api}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(host)}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error("Club not found");
  return (await response.json()).club_id as string;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get(authCookieName())?.value;
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token ?? ""}`,
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.detail ?? "Payment request failed");
  return body as T;
}

export async function getPayments() {
  return request<ApiPayment[]>(`/api/v1/clubs/${await clubId()}/payments`);
}

export async function createPayment(input: unknown) {
  return request<ApiPayment>(`/api/v1/clubs/${await clubId()}/payments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePayment(paymentId: string, input: unknown) {
  return request<ApiPayment>(
    `/api/v1/clubs/${await clubId()}/payments/${paymentId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}
