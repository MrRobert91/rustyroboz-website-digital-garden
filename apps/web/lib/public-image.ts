import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Return the web path (e.g. "/images/about/portrait.jpg") only if the file
 * actually exists under apps/web/public, otherwise undefined. Lets pages opt
 * into real photos without ever rendering a broken image before they are added.
 *
 * Pass paths relative to the public root, with or without a leading slash.
 */
export function publicImage(webPath: string): string | undefined {
  const clean = webPath.replace(/^\/+/, "");
  const abs = path.join(process.cwd(), "public", clean);
  return existsSync(abs) ? `/${clean}` : undefined;
}

/** First existing image among the given candidate web paths. */
export function firstPublicImage(...candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    const found = publicImage(candidate);
    if (found) {
      return found;
    }
  }
  return undefined;
}
