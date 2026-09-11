import "server-only";

import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { authCookieName } from "@/lib/auth";

const apiOrigin = process.env.API_URL ?? "http://localhost:8000";

function hostnameOnly(host: string) {
  return host.replace(/:\d+$/, "");
}

export type ApiTeam = { team_id: string; name: string; external_name: string | null; external_provider?: string | null; external_id?: string | null; external_league_id?: string | null; external_url?: string | null };
export type ApiPlayer = {
  player_id: string;
  team_id: string | null;
  legal_first_name: string;
  legal_last_name: string;
  position: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  fa_fan_id: string | null;
  auto_renew_next_season: boolean;
  homegrown_player: boolean;
  registration_status: string;
  consent_status: string;
  notes: string | null;
};
export type ApiFixture = {
  fixture_id: string;
  team_id: string;
  title: string;
  opposition: string | null;
  is_home: boolean | null;
  competition: string | null;
  starts_at: string;
  venue: string;
  home_score: number | null;
  away_score: number | null;
};
export type ApiAvailability = {
  availability_id: string;
  fixture_id: string;
  player_id: string;
  status: "available" | "maybe" | "unavailable";
  note: string | null;
};
export type ApiSelection = { selection_id: string; fixture_id: string; player_id: string; selected: boolean; updated_at: string };
export type ApiAttendance = { attendance_id: string; fixture_id: string; player_id: string; status: "attended" | "late" | "absent" | "injured"; note: string | null; recorded_at: string };
export type ApiImportRun = { import_run_id: string; team_id: string; status: "running" | "complete" | "failed"; started_at: string; completed_at: string | null; created_count: number; updated_count: number; error: string | null };
export type ApiNotification = { notification_id: string; club_id: string; kind: string; title: string; body: string; href: string | null; read_at: string | null; created_at: string };
export type ApiPayment = { payment_id: string; club_id: string; player_id: string; player_name: string; description: string; amount_pence: number; status: "pending" | "paid" | "overdue" | "cancelled"; due_date: string | null; paid_at: string | null; created_at: string };

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get(authCookieName())?.value;
  let response: Response;
  try {
    response = await fetch(`${apiOrigin}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Member API unavailable: check that the API is running and API_URL is correct");
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    const detail = payload?.detail ? ` — ${payload.detail}` : "";
    throw new Error(`Member API request failed: ${response.status}${detail}`);
  }
  return (await response.json()) as T;
}

export async function getMemberApiContext() {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(
    `${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`,
    { cache: "no-store" },
  );
  if (!club.ok) notFound();
  const clubData = (await club.json()) as { club_id: string };
  const clubId = clubData.club_id;
  const [teams, players, fixtures, payments] = await Promise.all([
    apiRequest<ApiTeam[]>(`/api/v1/public/clubs/${clubId}/teams`),
    apiRequest<ApiPlayer[]>(`/api/v1/clubs/${clubId}/players`),
    apiRequest<ApiFixture[]>(`/api/v1/clubs/${clubId}/fixtures`),
    apiRequest<ApiPayment[]>(`/api/v1/clubs/${clubId}/payments`),
  ]);
  const availabilityEntries = await Promise.all(
    fixtures.map(async (fixture) => [
      fixture.fixture_id,
      await apiRequest<ApiAvailability[]>(
        `/api/v1/clubs/${clubId}/fixtures/${fixture.fixture_id}/availability`,
      ),
    ] as const),
  );
  const selectionEntries = await Promise.all(
    fixtures.map(async (fixture) => [
      fixture.fixture_id,
      await apiRequest<ApiSelection[]>(`/api/v1/clubs/${clubId}/fixtures/${fixture.fixture_id}/selection`),
    ] as const),
  );
  const attendanceEntries = await Promise.all(
    fixtures.map(async (fixture) => [
      fixture.fixture_id,
      await apiRequest<ApiAttendance[]>(`/api/v1/clubs/${clubId}/fixtures/${fixture.fixture_id}/attendance`),
    ] as const),
  );
  return {
    clubId,
    teams,
    players,
    fixtures,
    payments,
    availability: Object.fromEntries(availabilityEntries) as Record<
      string,
      ApiAvailability[]
    >,
    selection: Object.fromEntries(selectionEntries) as Record<string, ApiSelection[]>,
    attendance: Object.fromEntries(attendanceEntries) as Record<string, ApiAttendance[]>,
  };
}

export async function saveMemberSelection(input: { fixtureId: string; playerId: string; selected: boolean }) {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`, { cache: "no-store" });
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiSelection>(`/api/v1/clubs/${clubId}/fixtures/${input.fixtureId}/selection`, {
    method: "PUT",
    body: JSON.stringify({ player_id: input.playerId, selected: input.selected }),
  });
}

export async function saveMemberAttendance(input: { fixtureId: string; playerId: string; status: ApiAttendance["status"]; note?: string }) {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`, { cache: "no-store" });
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiAttendance>(`/api/v1/clubs/${clubId}/fixtures/${input.fixtureId}/attendance`, {
    method: "PUT",
    body: JSON.stringify({ player_id: input.playerId, status: input.status, note: input.note ?? null }),
  });
}

export async function saveMemberAvailability(input: {
  fixtureId: string;
  playerId: string;
  status: ApiAvailability["status"];
  note?: string;
}) {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(
    `${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`,
    { cache: "no-store" },
  );
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiAvailability>(
    `/api/v1/clubs/${clubId}/fixtures/${input.fixtureId}/availability`,
    { method: "PUT", body: JSON.stringify({ player_id: input.playerId, status: input.status, note: input.note ?? null }) },
  );
}

export async function createMemberFixture(input: {
  teamId: string;
  title: string;
  startsAt: string;
  venue: string;
}) {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(
    `${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`,
    { cache: "no-store" },
  );
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiFixture>(`/api/v1/clubs/${clubId}/fixtures`, {
    method: "POST",
    body: JSON.stringify({
      team_id: input.teamId,
      title: input.title,
      starts_at: input.startsAt,
      venue: input.venue,
    }),
  });
}

export async function syncMemberFixtures() {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(
    `${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`,
    { cache: "no-store" },
  );
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<{ status: "queued"; created: number; updated: number; skipped: number }>(
    `/api/v1/clubs/${clubId}/fixture-import`,
    { method: "POST" },
  );
}

export async function getFixtureImportRunsForDashboard() {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`, { cache: "no-store" });
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiImportRun[]>(`/api/v1/clubs/${clubId}/fixture-import/runs`);
}

export async function getFixtureImportRuns() {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`, { cache: "no-store" });
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiImportRun[]>(`/api/v1/clubs/${clubId}/fixture-import/runs`);
}

export async function getMemberNotifications() {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`, { cache: "no-store" });
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiNotification[]>(`/api/v1/clubs/${clubId}/notifications`);
}

export async function markMemberNotificationRead(notificationId: string) {
  const host = (await headers()).get("host") ?? "";
  const club = await fetch(`${apiOrigin}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(hostnameOnly(host))}`, { cache: "no-store" });
  if (!club.ok) throw new Error("Club not found");
  const { club_id: clubId } = (await club.json()) as { club_id: string };
  return apiRequest<ApiNotification>(`/api/v1/clubs/${clubId}/notifications/${notificationId}/read`, { method: "PUT" });
}
