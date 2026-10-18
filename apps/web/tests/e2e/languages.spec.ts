import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseURL = "http://127.0.0.1:43119";
const headings = {
  en: [
    "an AI engineer",
    "About (me)",
    "Timeline",
    "Projects & Experiments",
    "Articles",
    /Let's\s*build\s*something\s*together\./,
    "Personal Chat (ask ROBOZ)",
    "AI Lab (the bench)",
    "Digital Garden",
    "Tag: ai-agents",
  ],
  es: [
    "ingeniero de IA",
    "Sobre mí",
    "Trayectoria",
    "Proyectos y experimentos",
    "Artículos",
    /Vamos a\s*crear\s*algo\s*juntos\./,
    "Chat personal (pregunta a ROBOZ)",
    "Laboratorio de IA (el taller)",
    "Digital Garden",
    "Etiqueta: ai-agents",
  ],
};

test("language selection survives navigation, reload and switching back on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/projects/the-last-observation");
  await page.getByRole("button", { name: "Cambiar a castellano" }).filter({ visible: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveURL(/\/projects\/the-last-observation$/);
  await expect(page.getByText("Galería", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ingeniero de IA");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: "Switch to English" }).filter({ visible: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("an AI engineer");
});

for (const locale of ["en", "es"] as const) {
  test(`every published document renders its ${locale} title, summary and language`, async ({ page, context }) => {
    test.setTimeout(240_000);
    await context.addCookies([{ name: "site-language", value: locale, url: baseURL }]);
    await page.route(/https:\/\/(?:www\.youtube|www\.youtube-nocookie|i\.ytimg)\.com\//, (route) => route.abort());
    const catalog = JSON.parse(
      readFileSync(resolve(process.cwd(), "../../content/translations", `${locale}.json`), "utf8"),
    ) as Record<string, { title: string; description: string }>;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [key, item] of Object.entries(catalog)) {
      if (key.startsWith("pages/")) continue;
      const response = await page.goto(`/${key}`, { waitUntil: "domcontentloaded" });
      expect(response?.status(), key).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("main > article")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
      await expect(page.locator("main > article > div").first()).toContainText(item.description);
      await expect(page).toHaveTitle(`${item.title} | Rusty Roboz Labs`);
    }
    expect(errors).toEqual([]);
  });

  test(`all main routes and controls are accessible and reflow in ${locale}`, async ({ page, context }) => {
    test.setTimeout(180_000);
    await context.addCookies([{ name: "site-language", value: locale, url: baseURL }]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const routes = [
        "/",
        "/about",
        "/timeline",
        "/projects",
        "/articles",
        "/contact",
        "/chat",
        "/lab",
        "/notes",
        "/tags/ai-agents",
      ];
      for (const [index, route] of routes.entries()) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toHaveText(headings[locale][index]);
        expect(await page.locator("h1").evaluate(heading => heading.scrollWidth - heading.clientWidth), `${locale} ${route}: heading fits its container at ${width}`).toBeLessThanOrEqual(1);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
          `${locale} ${route} at ${width}`,
        ).toBeLessThanOrEqual(1);
        const toggle = page
          .getByRole("button", { name: locale === "en" ? "Cambiar a castellano" : "Switch to English" })
          .filter({ visible: true });
        const box = await toggle.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
        if (width === 320) expect((await new AxeBuilder({ page }).analyze()).violations, route).toEqual([]);
        if (route === "/") await page.screenshot({ path: `test-results/home-${locale}-${width}.png`, fullPage: true });
      }
    }
  });
}
