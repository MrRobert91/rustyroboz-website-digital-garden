import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Rgb = [number, number, number];

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

function themeBlock(selector: string) {
  const escaped = selector.replace(".", "\\.");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  if (!match) throw new Error(`Missing palette block: ${selector}`);
  return match[1];
}

function token(block: string, name: string): Rgb {
  const match = block.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`));
  if (!match) throw new Error(`Missing HSL token: ${name}`);
  const [, hue, saturation, lightness] = match.map(Number);
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = ((hue % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((section % 2) - 1));
  const values: Rgb =
    section < 1 ? [chroma, x, 0] : section < 2 ? [x, chroma, 0] : section < 3 ? [0, chroma, x] : section < 4 ? [0, x, chroma] : section < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = l - chroma / 2;
  return values.map((value) => value + m) as Rgb;
}

function luminance(rgb: Rgb) {
  const linear = rgb.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(first: Rgb, second: Rgb) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe.each([
  ["light", themeBlock(":root")],
  ["dark", themeBlock(".dark")],
])("%s accessibility palette", (_theme, block) => {
  it.each([
    ["foreground", "background"],
    ["foreground", "paper-2"],
    ["muted-foreground", "background"],
    ["muted-foreground", "paper-2"],
    ["accent", "background"],
    ["accent", "paper-2"],
    ["accent-deep", "background"],
    ["accent-deep", "paper-2"],
    ["on-accent", "accent-surface"],
  ])("keeps %s on %s at 4.5:1 or better", (foreground, background) => {
    expect(ratio(token(block, foreground), token(block, background))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["control-border", "background"],
    ["control-border", "paper-2"],
    ["focus", "background"],
    ["focus", "paper-2"],
  ])("keeps non-text %s on %s at 3:1 or better", (foreground, background) => {
    expect(ratio(token(block, foreground), token(block, background))).toBeGreaterThanOrEqual(3);
  });
});
