import { defaultTheme, type ClubTheme } from "./club-themes";

export type ThemeSuggestion = { name: string; description: string; theme: ClubTheme };

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl({ r, g, b }: Rgb) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0; const l = (max + min) / 2; const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return rgbToHex({ r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 });
}

function luminance(hex: string) {
  return Object.values(hexToRgb(hex)).map((value) => value / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function readableText(background: string) {
  const value = luminance(background);
  return (value + 0.05) / 0.05 >= 1.05 / (value + 0.05) ? "#ffffff" : "#111827";
}

function palette(primary: string, secondary: string, accent: string, dark: boolean): ClubTheme["light"] {
  const source = dark ? defaultTheme.dark : defaultTheme.light;
  const primaryForeground = readableText(primary);
  const secondaryForeground = readableText(secondary);
  const button = dark ? accent : accent;
  const buttonForeground = readableText(button);
  return {
    ...source,
    primary,
    "primary-foreground": primaryForeground,
    secondary,
    "secondary-foreground": secondaryForeground,
    accent,
    "accent-soft": dark
      ? hslToHex(rgbToHsl(hexToRgb(accent)).h, rgbToHsl(hexToRgb(accent)).s, 0.2)
      : hslToHex(rgbToHsl(hexToRgb(accent)).h, Math.min(1, rgbToHsl(hexToRgb(accent)).s * 0.5), 0.92),
    button,
    "button-hover": hslToHex((rgbToHsl(hexToRgb(button)).h + 360) % 360, rgbToHsl(hexToRgb(button)).s, Math.max(0.2, Math.min(0.8, rgbToHsl(hexToRgb(button)).l + (dark ? 0.12 : -0.1)))),
    "button-foreground": buttonForeground,
  };
}

function makeTheme(primary: string, secondary: string, accent: string, variant: number): ClubTheme {
  const primaryHsl = rgbToHsl(hexToRgb(primary));
  const lightPrimary = variant === 2 ? hslToHex(primaryHsl.h, Math.min(1, primaryHsl.s * 0.8), Math.max(0.25, primaryHsl.l - 0.12)) : primary;
  const darkPrimary = variant === 1 ? hslToHex(primaryHsl.h, primaryHsl.s, Math.min(0.72, primaryHsl.l + 0.12)) : primary;
  return {
    light: palette(lightPrimary, secondary, accent, false),
    dark: palette(darkPrimary, hslToHex(rgbToHsl(hexToRgb(secondary)).h, rgbToHsl(hexToRgb(secondary)).s, 0.22), hslToHex(rgbToHsl(hexToRgb(accent)).h, rgbToHsl(hexToRgb(accent)).s, 0.72), true),
  };
}

export async function suggestThemes(file: File): Promise<ThemeSuggestion[]> {
  const image = new Image();
  image.src = URL.createObjectURL(file);
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not read badge")); });
  const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 64;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Colour analysis is unavailable");
  context.drawImage(image, 0, 0, 64, 64);
  URL.revokeObjectURL(image.src);
  const pixels = context.getImageData(0, 0, 64, 64).data;
  const buckets = new Map<string, { rgb: Rgb; count: number }>();
  for (let i = 0; i < pixels.length; i += 16) {
    if (pixels[i + 3] < 80) continue;
    const rgb = { r: Math.round(pixels[i] / 32) * 32, g: Math.round(pixels[i + 1] / 32) * 32, b: Math.round(pixels[i + 2] / 32) * 32 };
    const key = `${rgb.r},${rgb.g},${rgb.b}`;
    buckets.set(key, { rgb, count: (buckets.get(key)?.count ?? 0) + 1 });
  }
  const colours = [...buckets.values()].filter(({ rgb }) => { const hsl = rgbToHsl(rgb); return hsl.s > 0.18 && hsl.l > 0.08 && hsl.l < 0.92; }).sort((a, b) => b.count - a.count).slice(0, 6).map(({ rgb }) => rgbToHex(rgb));
  const primary = colours[0] ?? "#294a85";
  const secondary = colours.find((colour) => Math.abs(rgbToHsl(hexToRgb(colour)).h - rgbToHsl(hexToRgb(primary)).h) > 25) ?? hslToHex((rgbToHsl(hexToRgb(primary)).h + 42) % 360, Math.max(0.2, rgbToHsl(hexToRgb(primary)).s * 0.65), 0.72);
  const accent = colours[1] ?? hslToHex((rgbToHsl(hexToRgb(primary)).h + 18) % 360, Math.min(1, rgbToHsl(hexToRgb(primary)).s * 1.15), 0.48);
  return [
    { name: "Classic", description: "The badge’s strongest colours lead the design.", theme: makeTheme(primary, secondary, accent, 0) },
    { name: "Matchday", description: "A bolder, higher-energy version for fixtures and calls to action.", theme: makeTheme(primary, secondary, accent, 1) },
    { name: "Clean", description: "A softer interpretation with a lighter, modern feel.", theme: makeTheme(primary, secondary, accent, 2) },
  ];
}
