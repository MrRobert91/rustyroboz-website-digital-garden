import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "@/components/section-heading";
import { AboutFieldNotes } from "@/components/sections/about-field-notes";

describe("reusable heading levels", () => {
  it("renders page and section contexts without coupling semantics to appearance", () => {
    const page = render(<SectionHeading description="Description" eyebrow="Index" headingLevel={1} title="Articles" />);
    expect(screen.getByRole("heading", { level: 1, name: "Articles" })).toBeInTheDocument();
    page.unmount();

    render(<AboutFieldNotes paragraphs={["Biography"]} />);
    expect(screen.getByRole("heading", { level: 2, name: /about/i })).toBeInTheDocument();
  });
});
