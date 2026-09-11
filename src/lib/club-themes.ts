import type { CSSProperties } from "react";

export const themeGroups = [
  {
    title: "Surfaces and text",
    fields: [
      ["background", "Page background"],
      ["surface", "Cards and navigation"],
      ["surface-muted", "Subtle backgrounds"],
      ["foreground", "Main text"],
      ["muted", "Supporting text"],
      ["line", "Borders"],
    ],
  },
  {
    title: "Brand and buttons",
    fields: [
      ["primary", "Primary brand"],
      ["primary-foreground", "Text on primary"],
      ["secondary", "Secondary brand"],
      ["secondary-foreground", "Text on secondary"],
      ["accent", "Links and focus"],
      ["accent-soft", "Selected backgrounds"],
      ["button", "Button background"],
      ["button-hover", "Button hover"],
      ["button-foreground", "Button text"],
    ],
  },
  {
    title: "Status and effects",
    fields: [
      ["success", "Success background"],
      ["success-foreground", "Success text"],
      ["warning", "Warning background"],
      ["warning-foreground", "Warning text"],
      ["danger", "Error background"],
      ["danger-foreground", "Error text"],
      ["overlay", "Backdrop"],
      ["shadow", "Shadows"],
    ],
  },
] as const;

export type ThemeToken = (typeof themeGroups)[number]["fields"][number][0];
export type ThemePalette = Record<ThemeToken, string>;
export type ClubTheme = { light: ThemePalette; dark: ThemePalette };

const light: ThemePalette = {
  background: "#f1f5f9",
  surface: "#ffffff",
  "surface-muted": "#f8fafc",
  foreground: "#262737",
  muted: "#64748b",
  line: "#e2e8f0",
  primary: "#294a85",
  "primary-foreground": "#ffffff",
  secondary: "#dce8ff",
  "secondary-foreground": "#294a85",
  accent: "#4338ca",
  "accent-soft": "#eef2ff",
  button: "#4338ca",
  "button-hover": "#3730a3",
  "button-foreground": "#ffffff",
  success: "#dcfce7",
  "success-foreground": "#166534",
  warning: "#fef3c7",
  "warning-foreground": "#92400e",
  danger: "#fee2e2",
  "danger-foreground": "#991b1b",
  overlay: "#0f172a",
  shadow: "#0f172a",
};

const dark: ThemePalette = {
  background: "#020617",
  surface: "#0f172a",
  "surface-muted": "#1e293b",
  foreground: "#f1f5f9",
  muted: "#94a3b8",
  line: "#334155",
  primary: "#294a85",
  "primary-foreground": "#ffffff",
  secondary: "#dce8ff",
  "secondary-foreground": "#294a85",
  accent: "#a5b4fc",
  "accent-soft": "#1e1b4b",
  button: "#a5b4fc",
  "button-hover": "#c7d2fe",
  "button-foreground": "#1e1b4b",
  success: "#052e16",
  "success-foreground": "#86efac",
  warning: "#451a03",
  "warning-foreground": "#fcd34d",
  danger: "#450a0a",
  "danger-foreground": "#fca5a5",
  overlay: "#020617",
  shadow: "#000000",
};

// These complete theme objects can eventually come from the club settings table.
export const defaultTheme: ClubTheme = { light, dark };
const themes: Record<string, ClubTheme> = {
  "montpellier-fc": {
    light: {
      ...light,
      primary: "#fa9ce5",
      "primary-foreground": "#4a163f",
      secondary: "#e3edbd",
      "secondary-foreground": "#354515",
      accent: "#9d267e",
      "accent-soft": "#fce7f3",
      button: "#9d267e",
      "button-hover": "#831f69",
      "button-foreground": "#ffffff",
    },
    dark: {
      ...dark,
      primary: "#fa9ce5",
      "primary-foreground": "#4a163f",
      secondary: "#e3edbd",
      "secondary-foreground": "#354515",
      accent: "#f5a6df",
      "accent-soft": "#451737",
      button: "#f5a6df",
      "button-hover": "#f8c4eb",
      "button-foreground": "#451737",
    },
  },
  "club-oakwood": { light: { ...light }, dark: { ...dark } },
};

export function getClubTheme(clubId?: string): ClubTheme {
  return clubId && Object.hasOwn(themes, clubId)
    ? themes[clubId]
    : defaultTheme;
}

export function themeVariables(theme: ClubTheme): CSSProperties {
  return Object.fromEntries(
    Object.entries(theme).flatMap(([mode, palette]) =>
      Object.entries(palette).map(([token, color]) => [
        `--${mode}-${token}`,
        color,
      ]),
    ),
  ) as CSSProperties;
}
