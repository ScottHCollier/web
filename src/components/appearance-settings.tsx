"use client";

import { useSyncExternalStore } from "react";

const storageKey = "final-third-theme";

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function sync() {
    let preference: string | null = null;
    try { preference = localStorage.getItem(storageKey); } catch {}
    document.documentElement.classList.toggle("dark", preference === "dark" || (preference !== "light" && media.matches));
    callback();
  }
  window.addEventListener("storage", sync);
  window.addEventListener("theme-change", callback);
  media.addEventListener("change", sync);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener("theme-change", callback);
    media.removeEventListener("change", sync);
  };
}

export function AppearanceSettings() {
  const theme = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark") ? "dark" : "light", () => null);

  function selectTheme(value: string) {
    document.documentElement.classList.toggle("dark", value === "dark");
    try {
      localStorage.setItem(storageKey, value);
      Reflect.set(window.document, "cookie", `${storageKey}=${value}; path=/; max-age=31536000; samesite=lax`);
    } catch {}
    window.dispatchEvent(new Event("theme-change"));
  }

  return (
    <fieldset className="panel p-6">
      <legend className="sr-only">Appearance</legend>
      <h2 className="text-base font-medium">Appearance</h2>
      <p className="mt-2 text-sm text-muted">Choose how Final Third looks on this device. Changes apply immediately.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(["light", "dark"] as const).map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 hover:border-accent">
            <input type="radio" name="appearance" value={value} checked={theme === value} onChange={() => selectTheme(value)} className="h-4 w-4 accent-accent" />
            <span className="text-sm font-medium">{value === "light" ? "Light" : "Dark"}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
