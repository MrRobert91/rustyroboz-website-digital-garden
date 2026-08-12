import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

describe("notebook background texture", () => {
  it("uses one subdued decorative layer and solid reading surfaces", () => {
    const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    const keySurfaces = [
      "app/chat/page.tsx",
      "components/sections/hero.tsx",
      "components/sections/contact-signal.tsx",
      "components/sections/projects-prototypes.tsx",
    ];

    expect(layout).not.toContain("bg-paper-grid");
    expect(css).toMatch(/\.dotted-paper[\s\S]*?line-rule\) \/ 0\.22/);
    expect(css).toMatch(/\.reading-surface\s*{\s*background-color:\s*hsl\(var\(--background\)\)/);
    for (const file of keySurfaces) {
      expect(readFileSync(resolve(root, file), "utf8"), file).toContain("reading-surface");
    }
  });
});
