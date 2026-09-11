import type { Metadata } from "next";
import { NewsletterAdmin } from "@/components/newsletter-admin";

export const metadata: Metadata = { title: "Newsletter | Final Third" };

export default function NewsletterPage() {
  return <><div className="mb-6"><p className="eyebrow">Communications</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Newsletter</h1><p className="mt-2 max-w-2xl text-sm text-muted">Send updates to this club&apos;s opted-in subscribers.</p></div><NewsletterAdmin /></>;
}
