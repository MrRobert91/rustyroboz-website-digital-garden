import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("accessible functional type scale", () => {
  it("does not allow sub-14px utility or inline text in application UI", () => {
    const root = resolve(process.cwd());
    const violations = [resolve(root, "app"), resolve(root, "components")]
      .flatMap(sourceFiles)
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        return /text-\[(?:10|11|12|13)px\]|\btext-xs\b|fontSize:\s*(?:10|11|12|13)\b/.test(source)
          ? [relative(root, file)]
          : [];
      });

    expect(violations).toEqual([]);
  });
});
