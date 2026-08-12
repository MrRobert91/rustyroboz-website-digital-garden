import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("perceivable hover states", () => {
  it("adds a non-color link/control cue and gates transformations to hover-capable devices", () => {
    const root = resolve(process.cwd());
    const css = readFileSync(resolve(root, "app/globals.css"), "utf8");
    const source = [resolve(root, "app"), resolve(root, "components")]
      .flatMap(sourceFiles)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(css).toMatch(/@media \(hover: hover\)[\s\S]*?\.interactive-link[\s\S]*?text-decoration-line:\s*underline/);
    expect(css).toMatch(/@media \(hover: hover\)[\s\S]*?\.interactive-control:hover[\s\S]*?border-color/);
    expect(source).not.toMatch(/(?:sm:)?hover:(?:-?translate|rotate|scale)/);
    expect(source).toContain("interactive-link");
    expect(source).toContain("hover-card");
  });
});
