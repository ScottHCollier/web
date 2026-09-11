"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function PublicEditMode({ canEdit }: { canEdit: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  if (!canEdit) return null;
  const editMode = searchParams.get("edit") === "1";
  return editMode ? <div className="public-edit-banner"><div className="public-container flex items-center justify-between gap-3"><span><strong>Editing club site</strong><span className="hidden sm:inline"> · Changes are made live from this page.</span></span><Link href={pathname} className="public-edit-exit" data-edit-mode-exit onClick={(event) => { event.preventDefault(); router.push(pathname); }}>Exit edit mode</Link></div></div> : null;
}
