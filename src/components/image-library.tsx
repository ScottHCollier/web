"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type LibraryImage = { image_id: string; folder_id: string | null; filename: string | null; size_bytes: number; width: number; height: number; url: string };
type Folder = { folder_id: string; parent_id: string | null; name: string };

export function ImageLibrary({ onChange }: { onChange?: (images: LibraryImage[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolder, setNewFolder] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function loadFolders() { const response = await fetch("/api/dashboard/image-folders", { cache: "no-store" }); if (response.ok) setFolders(await response.json() as Folder[]); }
  async function loadImages(folder = selectedFolder) { const response = await fetch(`/api/dashboard/images${folder ? `?folder_id=${encodeURIComponent(folder)}` : ""}`, { cache: "no-store" }); if (!response.ok) { setMessage("Could not load the image library."); return; } const next = await response.json() as LibraryImage[]; setImages(next); onChange?.(next); }
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const response = await fetch("/api/dashboard/image-folders", { cache: "no-store" });
      if (response.ok && mounted) setFolders(await response.json() as Folder[]);
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const response = await fetch(`/api/dashboard/images${selectedFolder ? `?folder_id=${encodeURIComponent(selectedFolder)}` : ""}`, { cache: "no-store" });
      if (!response.ok) { if (mounted) setMessage("Could not load the image library."); return; }
      const next = await response.json() as LibraryImage[];
      if (mounted) { setImages(next); onChange?.(next); }
    })();
    return () => { mounted = false; };
  }, [onChange, selectedFolder]);

  async function upload(file: File) { setUploading(true); setMessage(null); const form = new FormData(); form.append("image", file); const response = await fetch(`/api/dashboard/images${selectedFolder ? `?folder_id=${encodeURIComponent(selectedFolder)}` : ""}`, { method: "POST", body: form }); const payload = await response.json().catch(() => null); setUploading(false); if (!response.ok) { setMessage(payload?.detail ?? "Image upload failed."); return; } setMessage("Image added to your library."); await loadImages(); }
  async function createFolder(event: React.FormEvent) { event.preventDefault(); if (!newFolder.trim()) return; const response = await fetch("/api/dashboard/image-folders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: newFolder.trim() }) }); if (!response.ok) { setMessage("Could not create folder."); return; } setNewFolder(""); setMessage("Folder created."); await loadFolders(); }
  async function renameFolder(folder: Folder) { const name = window.prompt("Folder name", folder.name)?.trim(); if (!name || name === folder.name) return; const response = await fetch(`/api/dashboard/image-folders/${folder.folder_id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }); if (response.ok) { await loadFolders(); } else setMessage("Could not rename folder."); }
  async function deleteFolder(folder: Folder) { if (!window.confirm(`Delete the “${folder.name}” folder? Images will be kept in the library root.`)) return; const response = await fetch(`/api/dashboard/image-folders/${folder.folder_id}`, { method: "DELETE" }); if (!response.ok) { setMessage("Could not delete folder."); return; } if (selectedFolder === folder.folder_id) setSelectedFolder(null); await loadFolders(); setMessage("Folder deleted."); }
  async function renameImage(image: LibraryImage) { const filename = window.prompt("Image filename", image.filename ?? "")?.trim(); if (!filename || filename === image.filename) return; const response = await fetch(`/api/dashboard/images/${image.image_id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename }) }); if (response.ok) { await loadImages(); setMessage("Image renamed."); } else setMessage("Could not rename image."); }
  async function moveImage(image: LibraryImage, folderId: string | null) { const response = await fetch(`/api/dashboard/images/${image.image_id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(folderId ? { folder_id: folderId } : { move_to_root: true }) }); if (response.ok) { await loadImages(); setMessage("Image moved."); } else setMessage("Could not move image."); }
  async function remove(image: LibraryImage) { if (!window.confirm(`Delete ${image.filename ?? "this image"}?`)) return; const response = await fetch(`/api/dashboard/images/${image.image_id}`, { method: "DELETE" }); if (!response.ok) { setMessage("Could not delete image."); return; } await loadImages(); setMessage("Image deleted."); }

  const visibleImages = selectedFolder === null ? images.filter((image) => image.folder_id == null) : images;

  return <section className="panel p-6" aria-labelledby="image-library-title">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="image-library-title" className="text-base font-medium">Image library</h2><p className="mt-2 text-sm leading-relaxed text-muted">Organise reusable images into folders for your homepage and future content.</p></div><button type="button" className="button-primary rounded-lg px-4 py-2 text-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : "Upload image"}</button><input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} /></div>
    <div className="mt-5 flex flex-wrap items-center gap-2"><button type="button" className={`rounded-lg px-3 py-2 text-sm ${selectedFolder === null ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-muted"}`} onClick={() => setSelectedFolder(null)}>Root</button>{selectedFolder === null ? folders.map((folder) => <article key={folder.folder_id} className="flex items-center gap-2 rounded-xl border border-line bg-surface-muted px-4 py-3"><button type="button" className="text-sm font-medium text-accent" onClick={() => setSelectedFolder(folder.folder_id)}>📁 {folder.name}</button><button type="button" className="text-xs text-muted hover:text-foreground" onClick={() => void renameFolder(folder)} aria-label={`Rename ${folder.name}`}>✎</button><button type="button" className="text-xs text-danger hover:underline" onClick={() => void deleteFolder(folder)} aria-label={`Delete ${folder.name}`}>×</button></article>) : <button type="button" className="text-sm text-muted hover:text-accent" onClick={() => setSelectedFolder(null)}>← Back to root</button>}<form className="ml-auto flex gap-2" onSubmit={(event) => void createFolder(event)}><input value={newFolder} onChange={(event) => setNewFolder(event.target.value)} placeholder="New folder" className="w-32 rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm" aria-label="New folder name" /><button type="submit" className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:border-accent hover:text-accent">Create folder</button></form></div>
    {visibleImages.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visibleImages.map((image) => <article key={image.image_id} className="overflow-hidden rounded-xl border border-line bg-surface-muted"><div className="relative aspect-video"><Image src={image.url} alt={image.filename ?? "Uploaded image"} fill className="object-cover" unoptimized /></div><div className="grid gap-3 p-3"><p className="truncate text-xs text-muted" title={image.filename ?? undefined}>{image.filename ?? "Untitled image"}</p><div className="grid gap-2"><button type="button" className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-accent hover:border-accent" onClick={() => void renameImage(image)}>Rename image</button><label className="grid gap-1 text-xs text-muted"><span>Move to folder</span><select className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-foreground" value={image.folder_id ?? "root"} onChange={(event) => void moveImage(image, event.target.value === "root" ? null : event.target.value)}><option value="root">Root</option>{folders.map((folder) => <option key={folder.folder_id} value={folder.folder_id}>{folder.name}</option>)}</select></label><button type="button" className="w-full rounded-md border border-danger px-2 py-1.5 text-xs text-danger hover:bg-danger hover:text-danger-foreground" onClick={() => void remove(image)}>Delete image</button></div></div></article>)}</div> : <p className="mt-5 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">No images in this folder yet.</p>}
    {message ? <p className="mt-4 text-sm text-muted" role="status">{message}</p> : null}
  </section>;
}
