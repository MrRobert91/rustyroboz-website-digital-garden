import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RootLayout from "@/app/layout";

describe("root accessibility landmarks", () => {
  it("provides a first-class skip link and focusable main target", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <p>Page content</p>
      </RootLayout>,
    );
    const document = new DOMParser().parseFromString(markup, "text/html");
    const skipLink = document.querySelector("a.skip-link");
    const main = document.querySelector("main");

    expect(skipLink?.textContent?.trim()).toBe("Skip to main content");
    expect(skipLink?.getAttribute("href")).toBe("#main-content");
    expect(main?.getAttribute("id")).toBe("main-content");
    expect(main?.getAttribute("tabindex")).toBe("-1");
  });
});
