import Link from "next/link";

export function PublicHeroEditor({ canEdit, editMode, onEdit }: { canEdit: boolean; editMode: boolean; onEdit: () => void }) {
  if (!canEdit || !editMode) return null;
  return (
    <div className="public-hero-editor">
      <button type="button" onClick={onEdit} className="rounded-full border border-white/40 bg-black/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">Edit carousel</button>
      <Link href="/" className="ml-2 rounded-full border border-white/40 bg-black/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">Exit edit mode</Link>
    </div>
  );
}
