import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMarkdown } from "@/components/chat-markdown";

describe("text link treatment", () => {
  it("defines a bold, rust-colored and persistently underlined utility", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const rule = css.match(/\.text-link\s*\{([\s\S]*?)\}/)?.[1] ?? "";

    expect(rule).toContain("color: hsl(var(--accent-deep))");
    expect(rule).toContain("font-weight: 700");
    expect(rule).toContain("text-decoration-line: underline");
  });

  it("applies the shared style to long-form and chatbot links", () => {
    const mdxRenderer = readFileSync(resolve(process.cwd(), "components/mdx-renderer.tsx"), "utf8");
    expect(mdxRenderer.match(/className="text-link"/g)).toHaveLength(3);

    render(<ChatMarkdown content="[Read the source](/articles/example)" />);
    expect(screen.getByRole("link", { name: "Read the source" })).toHaveClass("text-link");
  });
});
