import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("global focus styles", () => {
  it("provides a high-visibility focus-visible indicator for interactive elements", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toMatch(/:where\([^)]*button[^)]*textarea[^)]*\):focus-visible/);
    expect(css).toMatch(/outline:\s*3px solid hsl\(var\(--focus\)\)\s*!important/);
    expect(css).toMatch(/outline-offset:\s*3px\s*!important/);
  });
});
