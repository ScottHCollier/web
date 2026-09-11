import { NextResponse } from "next/server";
import { authenticate, authCookieName } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "login" && action !== "register") return NextResponse.json({ detail: "Not found" }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password) return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
  const { result, error, status = 401 } = await authenticate(action, body.email, body.password);
  if (!result) return NextResponse.json({ detail: error }, { status });
  const response = NextResponse.json({ user: result.user });
  response.cookies.set(authCookieName(), result.access_token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: result.expires_in,
  });
  return response;
}
