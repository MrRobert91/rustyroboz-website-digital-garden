import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BlochSphere } from "@/components/widgets/bloch-sphere";
import { RobozAvatar } from "@/components/widgets/roboz-avatar";
import { WireframeRoboz } from "@/components/widgets/wireframe-roboz";

let intersectionCallback: IntersectionObserverCallback;
let prefersReducedMotion = false;

class VisibleIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
  observe(element: Element) {
    intersectionCallback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], this as never);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = "0px";
  thresholds = [0];
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", VisibleIntersectionObserver);
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 42));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: prefersReducedMotion,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  prefersReducedMotion = false;
  vi.unstubAllGlobals();
});

describe("continuous animation controls", () => {
  it.each([
    ["wireframe robot", <WireframeRoboz />],
    ["Bloch sphere", <BlochSphere />],
    ["chat avatar", <RobozAvatar />],
  ])("lets keyboard and pointer users pause and resume the %s", (_name, component) => {
    render(component);
    const pause = screen.getByRole("button", { name: "Pause animation" });
    expect(pause).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(pause);
    const resume = screen.getByRole("button", { name: "Resume animation" });
    expect(resume).toHaveAttribute("aria-pressed", "true");
    expect(cancelAnimationFrame).toHaveBeenCalled();

    fireEvent.click(resume);
    expect(screen.getByRole("button", { name: "Pause animation" })).toHaveAttribute("aria-pressed", "false");
  });

  it("starts static for reduced motion and only resumes after an explicit action", () => {
    prefersReducedMotion = true;
    render(<WireframeRoboz />);

    const resume = screen.getByRole("button", { name: "Resume animation" });
    expect(resume).toHaveAttribute("aria-pressed", "true");
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    act(() => fireEvent.click(resume));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
