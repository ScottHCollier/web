import { NextResponse } from "next/server";
import { getFixtureImportRunsForDashboard, syncMemberFixtures } from "@/lib/member-api";

export async function POST() {
  try {
    return NextResponse.json(await syncMemberFixtures());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sync fixtures";
    const status = message.includes("403") ? 403 : message.includes("422") ? 422 : message.includes("404") ? 404 : 502;
    return NextResponse.json({ detail: status === 502 ? "Unable to sync fixtures" : message }, { status });
  }
}

export async function GET() {
  try {
    return NextResponse.json(await getFixtureImportRunsForDashboard());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read sync status";
    const status = message.includes("403") ? 403 : message.includes("404") ? 404 : 502;
    return NextResponse.json({ detail: status === 502 ? "Unable to read sync status" : message }, { status });
  }
}
