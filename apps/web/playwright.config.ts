import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:43119",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      process.env.E2E_PRODUCTION === "1"
        ? "node scripts/start-e2e.cjs"
        : "npm run dev --workspace @rustyroboz/web -- --port 43119",
    url: "http://127.0.0.1:43119",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
