import { NextResponse } from "next/server";
import { markMemberNotificationRead } from "@/lib/member-api";

export async function POST(_: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    return NextResponse.json(await markMemberNotificationRead((await params).notificationId));
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Unable to mark notification read" }, { status: 400 });
  }
}
