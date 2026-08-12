import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Polaroid } from "@/components/notebook";
import { AboutFieldNotes } from "@/components/sections/about-field-notes";
import { ContactSignal } from "@/components/sections/contact-signal";

describe("image alternatives", () => {
  it("keeps a Polaroid caption separate from an informative alternative", () => {
    render(<Polaroid alt="David presenting an accessibility prototype." caption="LAB-04" src="/photo.jpg" />);

    expect(screen.getByRole("img", { name: "David presenting an accessibility prototype." })).toBeInTheDocument();
    expect(screen.getByText("lab-04")).toBeInTheDocument();
  });

  it("supports explicitly decorative Polaroid images", () => {
    const { container } = render(<Polaroid alt="" caption="MEMORY" src="/decorative.jpg" />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("uses contextual alternatives on About and Contact", () => {
    const { rerender } = render(
      <AboutFieldNotes paragraphs={["Biography"]} photos={{ first: "/portrait.jpg", second: "/talk.jpg" }} />,
    );
    expect(screen.getAllByAltText("David Robert standing in front of a glass building.")).toHaveLength(2);
    expect(screen.getAllByAltText("David Robert giving a talk beside a screen showing a robotic hand.")).toHaveLength(2);

    rerender(<ContactSignal photo="/contact.jpg" />);
    expect(screen.getByAltText("Portrait of David Robert.")).toBeInTheDocument();
  });
});
