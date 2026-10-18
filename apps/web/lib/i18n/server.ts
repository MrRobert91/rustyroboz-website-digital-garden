import { cookies } from "next/headers";
import { createTranslator, localeCookie, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get(localeCookie)?.value === "es" ? "es" : "en";
}

export async function getTranslation() {
  return createTranslator(await getLocale());
}
