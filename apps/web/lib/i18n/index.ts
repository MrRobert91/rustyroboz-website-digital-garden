import en from "./en.json";
import es from "./es.json";

export type Locale = "en" | "es";
export const localeCookie = "site-language";
export function createTranslator(locale: Locale) {
  const catalog: Record<string, string> = locale === "es" ? es : en;
  return function t<T>(value: T): T {
    if (typeof value !== "string") return value;
    const translated = catalog[value];
    return (translated ?? value) as T;
  };
}
