import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeToggle } from "@/components/theme-toggle";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("exposes the active theme and the action that will be performed", async () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);

    const toggle = await screen.findByRole("button", { name: /switch to light mode/i });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveClass("size-11");

    fireEvent.click(toggle);

    await waitFor(() => expect(screen.getByRole("button", { name: /switch to dark mode/i })).toHaveAttribute("aria-pressed", "false"));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
