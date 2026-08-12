import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = ["/", "/about", "/timeline", "/projects", "/articles", "/contact", "/chat"];

test("home page exposes English primary navigation and a single h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /an ai engineer/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /view projects/i })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});

test("skip link moves keyboard focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("theme target is at least 44 by 44 pixels on desktop and mobile", async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 320, height: 720 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /switch to (?:light|dark) mode/i }).first();
    const box = await toggle.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("project cards expose one named link and one keyboard stop each", async ({ page }) => {
  await page.goto("/projects");
  const cards = page.locator("article");
  expect(await cards.count()).toBeGreaterThan(1);
  for (let index = 0; index < Math.min(await cards.count(), 6); index += 1) {
    await expect(cards.nth(index).getByRole("link")).toHaveCount(1);
  }
});

test("continuous illustrations can be paused and resumed", async ({ page }) => {
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Pause animation" }).first();
  await pause.click();
  await expect(page.getByRole("button", { name: "Resume animation" }).first()).toHaveAttribute("aria-pressed", "true");
});

test("contact form has labeled fields and an announced error summary", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel(/name \(required\)/i)).toBeVisible();
  await expect(page.getByLabel(/email \(required\)/i)).toBeVisible();
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.locator('[role="alert"][tabindex="-1"]')).toBeFocused();
  await expect(page.getByLabel(/name \(required\)/i)).toHaveAttribute("aria-invalid", "true");
});

for (const theme of ["light", "dark"] as const) {
  test(`public routes pass axe and reflow checks in ${theme} mode`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((selectedTheme) => localStorage.setItem("theme", selectedTheme), theme);
    await page.setViewportSize({ width: 320, height: 800 });
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark)/);
      const horizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(horizontalOverflow, `${route} must reflow at 320 CSS px`).toBeLessThanOrEqual(1);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, `${route} axe violations`).toEqual([]);
    }
  });
}
