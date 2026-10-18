"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createTranslator, localeCookie, type Locale } from "@/lib/i18n";

const LanguageContext = createContext<Locale>("en");

export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LanguageContext.Provider value={locale}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const locale = useContext(LanguageContext);
  return { locale, t: createTranslator(locale) };
}

export function Text({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <>{t(children)}</>;
}

export function LanguageToggle() {
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const next = locale === "en" ? "es" : "en";
  return (
    <button
      aria-label={locale === "en" ? "Cambiar a castellano" : "Switch to English"}
      className="interactive-control grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full border border-control-border px-2 font-mono text-sm text-foreground hover:text-accent"
      lang={next}
      disabled={!mounted}
      onClick={() => {
        document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
        // A full navigation refreshes Server Components, MDX and metadata together.
        window.location.reload();
      }}
      title={locale === "en" ? "Castellano" : "English"}
      type="button"
    >
      {next.toUpperCase()}
    </button>
  );
}
