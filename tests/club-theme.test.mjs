import assert from "node:assert/strict";
import test from "node:test";
import {
  getClubTheme,
  themeVariables,
  themeGroups,
} from "../src/lib/club-themes.ts";
import { demoClubs } from "../src/lib/demo-data.ts";

function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((part) => parseInt(part, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

test("each club has complete light and dark palettes and CSS variables", () => {
  const keys = themeGroups.flatMap((group) => group.fields.map(([key]) => key));
  for (const club of demoClubs) {
    const variables = themeVariables(club.theme);
    for (const mode of ["light", "dark"]) {
      assert.deepEqual(Object.keys(club.theme[mode]).sort(), [...keys].sort());
      for (const key of keys) {
        assert.match(club.theme[mode][key], /^#[a-f\d]{6}$/i);
        assert.equal(variables[`--${mode}-${key}`], club.theme[mode][key]);
      }
    }
  }
});

test("demo theme text and backgrounds have readable contrast in both appearances", () => {
  const pairs = [
    ["foreground", "background"],
    ["foreground", "surface"],
    ["muted", "surface"],
    ["primary-foreground", "primary"],
    ["secondary-foreground", "secondary"],
    ["button-foreground", "button"],
    ["button-foreground", "button-hover"],
    ["accent", "surface"],
    ["accent", "accent-soft"],
    ["success-foreground", "success"],
    ["warning-foreground", "warning"],
    ["danger-foreground", "danger"],
  ];
  for (const club of demoClubs) {
    for (const [mode, palette] of Object.entries(club.theme)) {
      for (const [text, background] of pairs) {
        const values = [
          luminance(palette[text]),
          luminance(palette[background]),
        ].sort((a, b) => b - a);
        const contrast = (values[0] + 0.05) / (values[1] + 0.05);
        assert.ok(
          contrast >= 4.5,
          `${club.id} ${mode}: ${text}/${background} contrast ${contrast}`,
        );
      }
    }
  }
});

test("domain themes remain distinct and unknown clubs use a full fallback", () => {
  assert.notEqual(
    getClubTheme("montpellier-fc").light.primary,
    getClubTheme("club-oakwood").light.primary,
  );
  assert.deepEqual(
    Object.keys(getClubTheme("unknown").light),
    Object.keys(getClubTheme().light),
  );
  const changed = structuredClone(getClubTheme("montpellier-fc"));
  changed.light.button = "#123456";
  assert.equal(themeVariables(changed)["--light-button"], "#123456");
  assert.notEqual(getClubTheme("montpellier-fc").light.button, "#123456");
});
