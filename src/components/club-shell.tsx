"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { WorkspaceSearch } from "@/components/workspace-search";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import type { AuthUser, Club, ClubRole } from "@/types/club";
import { canAccessRole, roleLabel } from "@/lib/roles";
import { useClub } from "@/components/club-provider";
import { dashboardHref, dashboardNavigation } from "@/lib/navigation";
import { themeVariables } from "@/lib/club-themes";

const navigation = dashboardNavigation.filter(([path]) => path !== "settings");

const sidebarStorageKey = "final-third-sidebar";

function subscribeToSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("sidebar-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sidebar-change", callback);
  };
}

function getSidebarSnapshot() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === `${sidebarStorageKey}=collapsed`);
}

export function ClubShell({
  children,
  memberClubs,
  user,
  role,
  initialCollapsed = false,
}: {
  children: ReactNode;
  memberClubs: (Club & { href: string; role: ClubRole })[];
  user: AuthUser;
  role: ClubRole;
  initialCollapsed?: boolean;
}) {
  const club = useClub();
  const pathname = usePathname();
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "";
  const browserHostname = typeof window === "undefined" ? "" : window.location.hostname;
  const isCentralHost = !baseDomain || browserHostname === baseDomain || browserHostname === `www.${baseDomain}`;
  const publicWebsiteHref = isCentralHost ? `/${encodeURIComponent(club.slug)}` : "/";
  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    getSidebarSnapshot,
    () => initialCollapsed,
  );

  function updateCollapsed(value: boolean) {
    document.cookie = `${sidebarStorageKey}=${value ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event("sidebar-change"));
  }
  return (
    <div
      className={`flex min-h-screen w-full bg-surface-muted ${collapsed ? "sidebar-collapsed" : ""}`}
    >
      <button
        type="button"
        className={`fixed inset-0 z-19 border-0 bg-overlay/20 ${collapsed ? "hidden" : "hidden max-md:block"}`}
        aria-label="Close navigation"
        onClick={() => updateCollapsed(true)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex h-screen w-56 flex-shrink-0 flex-col overflow-y-auto bg-surface px-4 py-6 max-xl:w-48 max-md:top-16 max-md:h-auto max-md:w-64 max-md:rounded-t-2xl max-md:p-4 ${collapsed ? "px-3 max-md:hidden" : ""}`}
        style={collapsed ? { width: "4.5rem" } : undefined}
      >
        <button
          type="button"
          className="flex w-full items-center gap-2.5 border-0 bg-transparent px-1 pb-6 text-left"
          popoverTarget="club-switcher"
          aria-haspopup="dialog"
          aria-label={`Switch club, current club: ${club.name}`}
          title="Switch club"
        >
          {club.badgeUrl ? (
            <Image
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary object-contain text-xs font-semibold text-primary-foreground"
              src={club.badgeUrl}
              alt={`${club.name} badge`}
              width={43}
              height={49}
              unoptimized
            />
          ) : (
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground" aria-hidden="true">
              {club.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </div>
          )}
          <span className={`min-w-0 flex-1 ${collapsed ? "hidden" : ""}`}>
            <strong className="text-xs font-medium">{club.name}</strong>
          </span>
        </button>
        <nav id="club-navigation" aria-label="Club navigation" className="grid gap-2">
          {navigation.filter(([, , , minimumRole]) => canAccessRole(role, minimumRole)).map(([path, label, icon]) => {
            const href = dashboardHref(path, club.slug);
            return (
              <Link
                key={path}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs hover:bg-surface-muted ${pathname === href ? "bg-accent-soft text-accent" : "text-muted"} ${collapsed ? "justify-center px-2" : ""}`}
                aria-label={label}
                title={collapsed ? label : undefined}
                aria-current={pathname === href ? "page" : undefined}
              >
                <Icon name={icon} />
                <span className={collapsed ? "hidden" : ""}>{label}</span>
              </Link>
            );
          })}
        </nav>
        <section className="mt-auto border-t border-line pt-4" aria-label="Account">
          <div className="grid gap-0.5">
            <Link
              href={dashboardHref("settings", club.slug)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-xs hover:bg-surface-muted ${pathname === dashboardHref("settings", club.slug) ? "bg-accent-soft text-accent " : "text-muted "} ${collapsed ? "justify-center px-2" : ""}`}
              aria-label="Settings"
              aria-current={pathname === dashboardHref("settings", club.slug) ? "page" : undefined}
              title={collapsed ? "Settings" : undefined}
              onClick={() => { if (window.matchMedia("(max-width: 767px)").matches) updateCollapsed(true); }}
            >
              <Icon name="settings" />
              <span className={collapsed ? "hidden" : ""}>Settings</span>
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-xs text-muted hover:bg-surface-muted "
              aria-label="Log out"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
              }}
            >
              <Icon name="logout" />
              <span className={collapsed ? "hidden" : ""}>Log out</span>
            </button>
          </div>
          <div className={`flex items-center gap-2.5 pt-4 ${collapsed ? "justify-center px-0" : "px-1"}`}>
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground">DM</span>
            <button type="button" className={`min-w-0 text-left ${collapsed ? "hidden" : ""}`} popoverTarget="user-switcher" aria-haspopup="dialog" title="Switch demo user">
              <strong className="block text-xs font-medium">{user.name}</strong>
              <span className="mt-1 block text-xs text-muted">{roleLabel(role)} · {user.email}</span>
            </button>
          </div>
        </section>
        <div
          id="club-switcher"
          popover="auto"
          role="dialog"
          aria-labelledby="club-switcher-title"
          className={`fixed inset-auto top-5 z-50 m-0 max-h-9/10 w-88 overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-foreground shadow-xl shadow-shadow/15 max-md:bottom-4 max-md:left-4 max-md:right-4 max-md:top-auto max-md:w-auto ${collapsed ? "left-20" : "left-60"}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <h2 id="club-switcher-title">Switch club</h2>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-surface-muted text-xl text-muted"
              popoverTarget="club-switcher"
              popoverTargetAction="hide"
              aria-label="Close club switcher"
            >
              ×
            </button>
          </div>
          <nav className="grid gap-1 p-2.5" aria-label="Your clubs">
            {memberClubs.map((memberClub) => (
              <Link
                key={memberClub.id}
                href={memberClub.href}
                className="flex items-center gap-2.5 rounded-lg p-3 text-xs hover:bg-accent-soft "
                aria-current={memberClub.id === club.id ? "true" : undefined}
                onClick={(event) =>
                  event.currentTarget
                    .closest<HTMLElement>("[popover]")
                    ?.hidePopover()
                }
              >
                {memberClub.badgeUrl ? (
                  <Image
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full object-contain text-xs font-semibold"
                    src={memberClub.badgeUrl}
                    alt=""
                    width={43}
                    height={49}
                    unoptimized
                  />
                ) : (
                  <span
                    className="club-badge grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-xs font-semibold"
                    style={themeVariables(memberClub.theme)}
                    aria-hidden="true"
                  >
                    {memberClub.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <strong className="block text-xs font-medium">{memberClub.name}</strong>
                  <span className="text-xs text-muted">{roleLabel(memberClub.role)}</span>
                </span>
                {memberClub.id === club.id && (
                  <span className="ml-auto rounded-md bg-surface-muted px-2 py-1 text-xs text-muted ">Current</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div
          id="user-switcher"
          popover="auto"
          role="dialog"
          aria-labelledby="user-switcher-title"
          className={`fixed inset-auto bottom-5 z-50 m-0 w-88 overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-foreground shadow-xl shadow-shadow/15 max-md:bottom-4 max-md:left-4 max-md:right-4 max-md:w-auto ${collapsed ? "left-20" : "left-60"}`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line p-5">
            <h2 id="user-switcher-title">Switch demo user</h2>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-surface-muted text-xl text-muted" popoverTarget="user-switcher" popoverTargetAction="hide" aria-label="Close user switcher">×</button>
          </div>
          <div className="p-4 text-sm text-muted">
            Signed in as <strong className="text-foreground">{user.email}</strong>
            <p className="mt-2 text-xs">Club membership and roles are currently managed by the development fixtures.</p>
          </div>
        </div>
      </aside>
      <div className={`flex h-dvh min-w-0 flex-1 flex-col overflow-hidden bg-surface max-md:ml-0 ${collapsed ? "ml-18" : "ml-56 max-xl:ml-48"}`}>
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 bg-surface pr-6 max-md:h-16 max-md:sticky max-md:top-0 max-md:z-30 max-md:pr-4">
          <div className="flex min-w-0 items-center gap-3 max-md:flex-1 max-md:gap-2">
            <button
              type="button"
              className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border-0 bg-surface text-muted hover:bg-surface-muted hover:text-accent"
              onClick={() => updateCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              aria-controls="club-navigation"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon name="panel" />
            </button>
            <WorkspaceSearch role={role} />
          </div>
          <Link href={publicWebsiteHref} className="shrink-0 text-xs text-muted hover:text-accent">View website</Link>
        </header>
        <div className="relative mb-6 mr-6 min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-background p-1 max-md:mb-4 max-md:mr-3">
          <main id="main-content" className="relative h-full overflow-y-auto overscroll-contain px-4 pb-7 pt-4 max-md:px-2.5 max-md:py-3">
        {children}
          </main>
        </div>
      </div>
    </div>
  );
}
