import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { findClubIdByDomain } from "@/lib/club-host";
import { getClubTheme, themeVariables } from "@/lib/club-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Final Third | Clubhouse", template: "%s" },
  description:
    "A shared home for grassroots football clubs, players, parents, and volunteers.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const host = (await headers()).get("host") ?? "";
  const fallbackTheme = getClubTheme(findClubIdByDomain(host));
  let theme = fallbackTheme;
  try {
    const response = await fetch(`${process.env.API_URL ?? "http://localhost:8000"}/api/v1/public/clubs/resolve?hostname=${encodeURIComponent(host.replace(/:\d+$/, ""))}`, { cache: "no-store" });
    if (response.ok) {
      const club = await response.json() as { theme?: typeof fallbackTheme | null };
      theme = club.theme ?? fallbackTheme;
    }
  } catch {
    // The frontend fallback theme keeps the shell usable if the API is unavailable.
  }
  const savedTheme = (await cookies()).get("final-third-theme")?.value;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={themeVariables(theme)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${savedTheme === "dark" ? "dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
