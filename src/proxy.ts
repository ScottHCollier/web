import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/clubs\/([^/]+)\/dashboard(?:\/(.*))?$/);
  if (!match) return NextResponse.next();

  const slug = decodeURIComponent(match[1]);
  const remainder = match[2] ? `/${match[2]}` : "";
  const headers = new Headers(request.headers);
  headers.set("x-final-third-club-slug", slug);
  const response = NextResponse.rewrite(new URL(`/dashboard${remainder}`, request.url), { request: { headers } });
  response.cookies.set("final-third-dashboard-club-slug", slug, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}

export const config = {
  matcher: ["/clubs/:path*"],
};
