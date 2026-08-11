import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/projects/example-project");
  });

  it("marks the current destination semantically in desktop and mobile navigation", () => {
    render(<SiteHeader />);

    const currentLinks = screen.getAllByRole("link", { name: "Projects", current: "page" });
    expect(currentLinks).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: "About" })) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});
