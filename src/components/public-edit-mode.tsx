"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function PublicEditMode({ canEdit }: { canEdit: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (!canEdit) return null;
  const editMode = searchParams.get("edit") === "1";
  const destination = editMode ? pathname : `${pathname}?edit=1`;
  return <>
    <Link href={destination} className={`public-edit-toggle ${editMode ? "is-active" : ""}`} aria-pressed={editMode}>{editMode ? "Exit edit mode" : "Edit site"}</Link>
    {editMode ? <div className="public-edit-banner"><div className="public-container flex items-center justify-between gap-3"><span><strong>Editing club site</strong><span className="hidden sm:inline"> · Changes are made live from this page.</span></span><Link href={pathname}>Exit edit mode</Link></div></div> : null}
  </>;
}
