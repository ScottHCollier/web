import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Articles | Final Third" };

export default async function ArticlesPage() {
  redirect("/news?edit=1");
}
