"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PublicHeroEditor } from "@/components/public-hero-editor";
import type { LibraryImage } from "@/components/image-library";

export type HeroSlide = {
  position: number;
  imageId: string | null;
  imageUrl: string | null;
  imageName: string | null;
  imagePosition: "top" | "center" | "bottom";
  eyebrow: string;
  title: string;
  body: string;
};

const defaultSlide = (position: number): HeroSlide => ({
  position,
  imageId: null,
  imageUrl: null,
  imageName: null,
  imagePosition: "center",
  eyebrow: "ONE CLUB. EVERYONE COUNTS.",
  title: "More than a football club.",
  body: "A home for players, families and volunteers.",
});

export function PublicHeroCarousel({
  slides: suppliedSlides,
  canEdit,
  editMode,
}: {
  slides: HeroSlide[];
  canEdit: boolean;
  editMode: boolean;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => [0, 1, 2].map((position) => suppliedSlides.find((slide) => slide.position === position) ?? defaultSlide(position)));
  const [active, setActive] = useState(0);
  const [previousActive, setPreviousActive] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [fileNames, setFileNames] = useState<Record<number, string>>(() => Object.fromEntries(suppliedSlides.filter((slide) => slide.imageName).map((slide) => [slide.position, slide.imageName as string])));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryImage[]>([]);
  const [editorSlide, setEditorSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        setPreviousActive(current);
        return (current + 1) % slides.length;
      });
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (!editorOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [editorOpen]);

  function updateSlide(position: number, values: Partial<HeroSlide>) {
    setSlides((current) => current.map((slide) => slide.position === position ? { ...slide, ...values } : slide));
  }

  async function openEditor() {
    setEditorOpen(true);
    setEditorSlide(0);
    const response = await fetch("/api/dashboard/images", { cache: "no-store" });
    if (response.ok) setLibrary(await response.json() as LibraryImage[]);
  }

  async function upload(position: number, file: File) {
    setFileNames((current) => ({ ...current, [position]: file.name }));
    const formData = new FormData();
    formData.append("image", file);
    formData.append("position", String(position));
    setMessage(null);
    const response = await fetch(`/api/dashboard/hero-image?position=${position}`, { method: "POST", body: formData });
    const payload = await response.json().catch(() => null);
    if (!response.ok) { setMessage(payload?.detail ?? "Image upload failed."); return; }
    const nextSlides = slides.map((slide) => slide.position === position ? { ...slide, imageId: payload.image_id, imageUrl: payload.hero_url, imageName: file.name } : slide);
    setSlides(nextSlides);
    const libraryResponse = await fetch("/api/dashboard/images", { cache: "no-store" });
    if (libraryResponse.ok) setLibrary(await libraryResponse.json() as LibraryImage[]);
    await persistSlides(nextSlides);
  }

  async function persistSlides(slidesToSave: HeroSlide[]) {
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/dashboard/hero-slides", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slides: slidesToSave.map(({ position, imageId, imagePosition, eyebrow, title, body }) => ({ position, image_id: imageId, image_position: imagePosition, eyebrow, title, body })) }),
    });
    const payload = await response.json().catch(() => null);
    setSaving(false);
    setMessage(response.ok ? "Homepage hero saved." : payload?.detail ?? "Could not save homepage hero.");
    return response.ok;
  }

  async function save() {
    if (await persistSlides(slides)) setEditorOpen(false);
  }

  return <>
    <section className={`public-hero public-hero-carousel ${editMode ? "public-hero-editing" : ""}`}>
      <div className="public-hero-slides" aria-live="polite">
        {slides.map((slide, index) => slide.imageUrl ? <Image key={slide.position} src={slide.imageUrl} alt="" fill className={`public-hero-transition-image ${index === active ? "is-active" : index === previousActive ? "is-exiting" : ""} object-cover`} style={{ objectPosition: slide.imagePosition }} aria-hidden={index !== active} loading="eager" unoptimized sizes="100vw" /> : null)}
      </div>
      <div className="public-hero-carousel-copy">
        {slides.map((slide, index) => <div className={`public-hero-slide-copy ${index === active ? "is-active" : ""}`} key={slide.position} aria-hidden={index !== active}>
          <p className="public-kicker">{slide.eyebrow}</p>
          <h1>{slide.title}</h1>
          <p className="public-hero-text">{slide.body}</p>
        </div>)}
      </div>
      <PublicHeroEditor canEdit={canEdit} editMode={editMode} onEdit={() => void openEditor()} />
      {editMode && canEdit && editorOpen ? <div className="public-hero-edit-overlay" role="dialog" aria-modal="true" aria-label="Edit hero carousel">
        <div className="public-hero-edit-panel"><div className="public-hero-edit-heading"><div><p className="public-kicker text-accent">Homepage</p><h2>Edit hero carousel</h2><p className="text-sm text-muted">Choose images and refine the copy for each slide.</p></div><div className="public-hero-edit-actions"><button type="button" className="button-primary rounded-lg px-4 py-2 text-sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button><button type="button" className="rounded-lg border border-line px-4 py-2 text-sm" onClick={() => setEditorOpen(false)}>Close</button></div></div>
          <div className="public-hero-edit-tabs" role="tablist" aria-label="Hero slides">{slides.map((slide) => <button type="button" key={slide.position} role="tab" aria-selected={editorSlide === slide.position} aria-controls={`hero-slide-panel-${slide.position}`} className={editorSlide === slide.position ? "is-active" : ""} onClick={() => setEditorSlide(slide.position)}>Slide {slide.position + 1}</button>)}</div>
          <div className="public-hero-edit-grid">
            {slides.filter((slide) => slide.position === editorSlide).map((slide) => <article className="public-hero-edit-card" id={`hero-slide-panel-${slide.position}`} role="tabpanel" key={slide.position}>
              <div className="public-hero-edit-image-column">
                <div className="public-hero-edit-preview">{slide.imageUrl ? <Image src={slide.imageUrl} alt="" fill className="object-cover" style={{ objectPosition: slide.imagePosition }} unoptimized sizes="(max-width: 700px) 100vw, 33vw" /> : <span>Choose an image</span>}</div>
                <div className="public-hero-edit-library grid gap-2"><span className="text-xs font-bold uppercase tracking-wider">Choose from library</span><div className="grid grid-cols-3 gap-2">{library.map((image) => <button type="button" key={image.image_id} className={`relative aspect-video overflow-hidden rounded border ${slide.imageId === image.image_id ? "border-accent ring-2 ring-accent" : "border-line"}`} onClick={() => { updateSlide(slide.position, { imageId: image.image_id, imageUrl: image.url, imageName: image.filename }); setFileNames((current) => ({ ...current, [slide.position]: image.filename ?? "Uploaded image" })); }}><Image src={image.url} alt={image.filename ?? "Uploaded image"} fill className="object-cover" unoptimized /></button>)}</div><label className="button-secondary cursor-pointer rounded-lg px-3 py-2 text-center text-xs">Upload new image<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(slide.position, file); }} /></label></div>
                <span className="public-hero-file-name">{fileNames[slide.position] ?? "No file selected"}</span>
              </div>
              <div className="public-hero-edit-controls">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider">Image placement<select value={slide.imagePosition} onChange={(event) => updateSlide(slide.position, { imagePosition: event.target.value as HeroSlide["imagePosition"] })}><option value="top">Top</option><option value="center">Centre</option><option value="bottom">Bottom</option></select></label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider">Eyebrow<input value={slide.eyebrow} onChange={(event) => updateSlide(slide.position, { eyebrow: event.target.value })} /></label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider">Title<input value={slide.title} onChange={(event) => updateSlide(slide.position, { title: event.target.value })} /></label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider">Text<textarea rows={3} value={slide.body} onChange={(event) => updateSlide(slide.position, { body: event.target.value })} /></label>
              </div>
            </article>)}
          </div>
        </div>
      </div> : null}
      {message ? <p className="absolute bottom-4 left-4 z-10 rounded-lg bg-surface px-3 py-2 text-sm text-muted" role="status">{message}</p> : null}
    </section>
  </>;
}
