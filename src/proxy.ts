import { NextResponse, type NextRequest } from "next/server";

const reservedPaths = new Set(["api", "login", "register", "onboarding", "forgot-password", "reset-password", "verify-email", "join", "dashboard", "_next"]);

function rewrite(request: NextRequest, destination: string, headerName: string, headerValue: string, slug?: string) {
  const headers = new Headers(request.headers);
  headers.set(headerName, headerValue);
  const response = NextResponse.rewrite(new URL(destination, request.url), { request: { headers } });
  if (slug) response.cookies.set("final-third-dashboard-club-slug", slug, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const baseDomain = (process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "").toLowerCase().replace(/\.$/, "");
  const hostname = request.nextUrl.hostname.toLowerCase();
  const isPlatformHost = !baseDomain || hostname === baseDomain || hostname === `www.${baseDomain}`;

  const legacyDashboard = pathname.match(/^\/dashboard(?:\/(.*))?$/);
  if (legacyDashboard) {
    const slug = request.cookies.get("final-third-dashboard-club-slug")?.value;
    if (slug) return NextResponse.redirect(new URL(`/${encodeURIComponent(slug)}/dashboard${legacyDashboard[1] ? `/${legacyDashboard[1]}` : ""}`, request.url));
    return NextResponse.next();
  }

  if (isPlatformHost) {
    const pathMatch = pathname.match(/^\/([^/]+)(\/.*)?$/);
    if (!pathMatch || reservedPaths.has(pathMatch[1].toLowerCase())) return NextResponse.next();
    const slug = decodeURIComponent(pathMatch[1]);
    const remainder = pathMatch[2] ?? "/";
    if (remainder === "/dashboard" || remainder.startsWith("/dashboard/")) {
      return rewrite(request, `/dashboard${remainder.slice("/dashboard".length) || ""}`, "x-final-third-club-slug", slug, slug);
    }
    return rewrite(request, remainder, "x-final-third-public-club-slug", slug);
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return rewrite(request, pathname, "x-final-third-dashboard-club-host", hostname);
  return rewrite(request, pathname, "x-final-third-public-club-host", hostname);
}

export const config = { matcher: ["/dashboard", "/dashboard/:path*", "/:path*"] };
