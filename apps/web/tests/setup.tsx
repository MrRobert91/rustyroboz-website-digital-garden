import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({ className: "font-display", variable: "--font-display" }),
  IBM_Plex_Serif: () => ({ className: "font-serif", variable: "--font-serif" }),
  Caveat: () => ({ className: "font-hand", variable: "--font-hand" }),
  JetBrains_Mono: () => ({ className: "font-mono", variable: "--font-mono" }),
  Manrope: () => ({ className: "font-manrope", variable: "--font-manrope" }),
  Newsreader: () => ({ className: "font-newsreader", variable: "--font-newsreader" }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ""} />,
}));

vi.mock("next-mdx-remote/rsc", () => ({
  MDXRemote: ({ source }: { source: string }) => <div data-testid="mdx-content">{source}</div>,
}));

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

// jsdom does not implement Element scrolling APIs (chat auto-scroll uses them).
Element.prototype.scrollTo = Element.prototype.scrollTo ?? (() => {});
