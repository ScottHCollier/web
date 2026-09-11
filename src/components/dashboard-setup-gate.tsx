"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function DashboardSetupGate({ children, role }: { children: ReactNode; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = role === "owner" || role === "admin";
  const [complete] = useState<boolean | null>(() => {
    if (!isAdmin) return true;
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(`final-third-setup-complete:${window.location.hostname}`) === "true";
  });
  const allowedDuringSetup = pathname === "/dashboard/setup" || pathname === "/dashboard/teams" || pathname === "/dashboard/club-settings";
  useEffect(() => {
    if (complete === false && !allowedDuringSetup) router.replace("/dashboard/setup");
  }, [allowedDuringSetup, complete, router]);
  if (complete === null || (complete === false && !allowedDuringSetup)) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Taking you to your setup guide…</div>;
  return <>{children}</>;
}
