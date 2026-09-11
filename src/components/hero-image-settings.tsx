"use client";

import Link from "next/link";

export function HeroImageSettings() {
  return (
    <section className="panel p-6" aria-labelledby="hero-image-title">
      <h2 id="hero-image-title" className="text-base font-medium">Homepage hero carousel</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Create three image-led slides for the public homepage, with custom text and live previews. Open the homepage in edit mode to configure them.</p>
      <Link href="/?edit=1" className="button-primary mt-5 inline-flex rounded-lg px-4 py-2 text-sm">Edit homepage hero</Link>
    </section>
  );
}
