import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const legacyMatch = request.nextUrl.pathname.match(/^\/dashboard(?:\/(.*))?$/);
  if (legacyMatch) {
    const slug = request.cookies.get("final-third-dashboard-club-slug")?.value;
    if (slug) {
      const remainder = legacyMatch[1] ? `/${legacyMatch[1]}` : "";
      return NextResponse.redirect(new URL(`/clubs/${encodeURIComponent(slug)}/dashboard${remainder}`, request.url));
    }
    return NextResponse.next();
  }
  const match = request.nextUrl.pathname.match(/^\/clubs\/([^/]+)\/dashboard(?:\/(.*))?$/);
  if (!match) {
    const publicMatch = request.nextUrl.pathname.match(/^\/clubs\/([^/]+)(?:\/(.*))?$/);
    if (!publicMatch) return NextResponse.next();
    const slug = decodeURIComponent(publicMatch[1]);
    const remainder = publicMatch[2] ? `/${publicMatch[2]}` : "/";
    const headers = new Headers(request.headers);
    headers.set("x-final-third-public-club-slug", slug);
    return NextResponse.rewrite(new URL(remainder, request.url), { request: { headers } });
  }

  const slug = decodeURIComponent(match[1]);
  const remainder = match[2] ? `/${match[2]}` : "";
  const headers = new Headers(request.headers);
  headers.set("x-final-third-club-slug", slug);
  const response = NextResponse.rewrite(new URL(`/dashboard${remainder}`, request.url), { request: { headers } });
  response.cookies.set("final-third-dashboard-club-slug", slug, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/clubs/:path*"],
};
