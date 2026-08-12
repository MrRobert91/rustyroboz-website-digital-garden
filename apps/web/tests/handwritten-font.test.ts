import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("handwritten font allowlist", () => {
  it("reserves font-hand for branding, large heading accents and decorative captions", () => {
    const root = resolve(process.cwd());
    const allowedCounts: Record<string, number> = {
      "app/chat/page.tsx": 1,
      "app/lab/page.tsx": 1,
      "app/layout.tsx": 1,
      "components/notebook.tsx": 1,
      "components/sections/about-field-notes.tsx": 1,
      "components/sections/bitacora.tsx": 1,
      "components/sections/hero.tsx": 1,
      "components/sections/logbook-timeline.tsx": 1,
      "components/sections/projects-prototypes.tsx": 2,
      "components/sections/stack-toolbox.tsx": 1,
      "components/site-header.tsx": 1,
    };
    const actual: Record<string, number> = {};

    for (const file of [resolve(root, "app"), resolve(root, "components")].flatMap(sourceFiles)) {
      const count = readFileSync(file, "utf8").match(/\bfont-hand\b/g)?.length ?? 0;
      if (count) actual[relative(root, file).replaceAll("\\", "/")] = count;
    }

    expect(actual).toEqual(allowedCounts);
  });
});
