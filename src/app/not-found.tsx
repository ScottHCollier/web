import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto my-10 w-11/12 max-w-xl panel p-6">
      <h1 className="text-2xl font-medium">Page unavailable</h1>
      <p className="mt-3 text-sm text-muted">
        This page or club could not be found.
      </p>
      <Link href="/" className="mt-4 inline-block text-accent">
        Back to the website
      </Link>
    </main>
  );
}
