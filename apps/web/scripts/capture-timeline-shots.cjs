// One-off helper: capture screenshots of live project sites for the timeline.
// Run from apps/web:  node scripts/capture-timeline-shots.cjs
const { chromium } = require("@playwright/test");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public", "images", "projects");

const TARGETS = [
  { url: "https://sharedbrain.sliplane.app/", out: "sharedbrain/image-01.png" },
  { url: "https://miralink.app/", out: "mira-link/image-01.png" },
  { url: "https://juego-zeus-y-apolo.sliplane.app/", out: "apolo-vs-zeus/image-01.png" },
  { url: "https://accessdoc-mx5p1m.sliplane.app/", out: "accessdoc/image-01.png" },
  { url: "https://rustyroboz.itch.io/thor-runner", out: "thor-runner/image-01.png" },
  { url: "https://www.cuentee.com/", out: "cuentee/image-01.png" },
  { url: "https://www.cartastrofe.com/", out: "cartastrofe/image-02.png" },
  {
    url: "https://learn.microsoft.com/en-us/users/davidrobert-6441/credentials/b14f86a8d09444d3",
    out: "azure-ai-engineer/image-01.png",
  },
];

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });

  for (const t of TARGETS) {
    const dest = path.join(ROOT, t.out);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    try {
      await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(6000); // let hero/render settle (cold starts, fonts)
      await page.screenshot({ path: dest });
      console.log("OK   ", t.out);
    } catch (err) {
      console.log("FAIL ", t.out, "-", String(err).split("\n")[0]);
    } finally {
      await ctx.close();
    }
  }

  await browser.close();
})();
