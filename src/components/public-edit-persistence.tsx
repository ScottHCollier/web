"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function PublicEditPersistence() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";

  useEffect(() => {
    if (!editMode) return;

    function preserveEditMode(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download") || target.closest("[data-edit-mode-exit]")) return;

      const url = new URL(target.href, window.location.origin);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/login") || url.pathname.startsWith("/api") || url.searchParams.has("edit")) return;

      event.preventDefault();
      url.searchParams.set("edit", "1");
      router.push(`${url.pathname}${url.search}${url.hash}`);
    }

    document.addEventListener("click", preserveEditMode, true);
    return () => document.removeEventListener("click", preserveEditMode, true);
  }, [editMode, router]);

  return null;
}
