import Link from "next/link";
import type { ReactNode } from "react";
import { getPublicClub } from "@/lib/public-club";
import Image from "next/image";
import { getAuthenticatedApiUser } from "@/lib/auth";
import { PublicAccountMenu } from "@/components/public-account-menu";
import { PublicEditMode } from "@/components/public-edit-mode";
import { PublicEditPersistence } from "@/components/public-edit-persistence";

const navigation = [
  ["/", "Home"],
  ["/news", "News"],
  ["/teams", "Teams"],
  ["/fixtures", "Fixtures"],
  ["/contact", "Contact"],
  ["/safeguarding", "Safeguarding"],
];

export async function generateMetadata() {
  const { club } = await getPublicClub();
  return { title: { default: club.name, template: `%s | ${club.name}` } };
}

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { club } = await getPublicClub();
  const authenticatedUser = await getAuthenticatedApiUser();
  const visibleNavigation = authenticatedUser
    ? [...navigation, ["/dashboard", "Dashboard"]]
    : navigation;
  const publicNavigation = visibleNavigation.filter(([href]) => href !== "/dashboard");
  const membership = authenticatedUser?.memberships.find((item) => item.club_id === club.id);
  const canEdit = membership?.role === "owner" || membership?.role === "admin";
  return (
    <div className="public-site flex min-h-dvh flex-col bg-background">
      <a href="#public-content" className="sr-only focus:not-sr-only focus:p-4">
        Skip to content
      </a>
      <header className="public-header">
        <PublicEditPersistence />
        <PublicEditMode canEdit={canEdit} />
        <div className="public-brandbar">
          <div className="public-container flex items-center justify-between gap-4">
            <Link href="/" className="public-brand">
              {club.badgeUrl ? (
                <Image src={club.badgeUrl} alt="" width={48} height={48} className="public-badge" unoptimized />
              ) : (
                <span className="public-badge public-badge-initials" aria-hidden="true">
                  {club.name.split(" ").map((word) => word[0]).join("")}
                </span>
              )}
              <span>{club.name}</span>
            </Link>
            <PublicAccountMenu authenticated={Boolean(authenticatedUser)} />
            <details className="public-mobile-menu public-menu">
              <summary aria-label="Open navigation"><span></span><span></span><span></span></summary>
              <nav aria-label="Public navigation">
                {publicNavigation.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
                {authenticatedUser ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login?next=/dashboard">Log in</Link>}
              </nav>
            </details>
          </div>
        </div>
        <div className="public-nav-bar">
          <div className="public-container flex items-center justify-between gap-5">
            <nav aria-label="Public navigation" className="public-nav public-nav-desktop">
              {publicNavigation.slice(1).map(([href, label]) => (
                <Link key={href} href={href}>{label}</Link>
              ))}
            </nav>
            {authenticatedUser ? <Link href="/dashboard" className="public-dashboard-link">Dashboard <span aria-hidden="true">↗</span></Link> : null}
          </div>
        </div>
      </header>
      <main
        id="public-content"
        className="public-main flex-1 py-8 md:py-12"
      >
        {children}
      </main>
      <footer className="public-footer">
        <div className="public-container">
          <div className="public-footer-main">
            <div className="public-footer-brand">
              <Link href="/" className="public-brand">
                {club.badgeUrl ? <Image src={club.badgeUrl} alt="" width={48} height={48} className="public-badge" unoptimized /> : <span className="public-badge public-badge-initials" aria-hidden="true">{club.name.split(" ").map((word) => word[0]).join("")}</span>}
                <span>{club.name}</span>
              </Link>
              <p>Grassroots football, together.</p>
              <p className="public-footer-note">A home for players, families, volunteers and everyone who makes the club what it is.</p>
            </div>
            <div>
              <h2 className="public-footer-heading">Explore</h2>
              <nav className="public-footer-links" aria-label="Footer navigation">
                {publicNavigation.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
              </nav>
            </div>
            <div>
              <h2 className="public-footer-heading">Clubhouse</h2>
              <nav className="public-footer-links" aria-label="Club links">
                <Link href="/contact">Get involved</Link>
                <Link href="/contact">Contact the club</Link>
                <Link href={authenticatedUser ? "/dashboard" : "/login?next=/dashboard"}>{authenticatedUser ? "Dashboard" : "Member sign in"}</Link>
              </nav>
            </div>
          </div>
          <div className="public-footer-bottom">
            <span>© {new Date().getFullYear()} {club.name}</span>
            <div><Link href="/">Privacy</Link><Link href="/">Terms</Link><Link href="/">Accessibility</Link></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
