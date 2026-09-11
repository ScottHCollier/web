"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

export function PublicAccountMenu({ authenticated }: { authenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        menuRef.current.removeAttribute("open");
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <details ref={menuRef} className="public-account-menu" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary aria-label={authenticated ? "Open account menu" : "Sign in"} title={authenticated ? "Account menu" : "Sign in"}>
        <Icon name="account" />
      </summary>
      <div className="public-account-popover">
        {authenticated ? <>
          <Link href="/dashboard">Dashboard</Link>
          <button type="button" onClick={logout}>Log out</button>
        </> : <Link href="/login?next=/dashboard">Log in</Link>}
      </div>
    </details>
  );
}
