import { expect, test } from "@playwright/test";

test("home page exposes primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /diseño, sistemas e ia aplicada/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /proyectos/i })).toBeVisible();
});

