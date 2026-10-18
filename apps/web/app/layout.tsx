import { getTranslation } from "@/lib/i18n/server";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site-config";
import { LanguageProvider } from "@/components/language-provider";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator } from "@/lib/i18n";
import "./globals.css";

// Every route must render its Server Components and metadata with the request's
// language cookie; do not serve a prerendered English detail page to Spanish readers.
export const dynamic = "force-dynamic";

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  display: "swap",
  variable: "--font-display",
});

const plexSerif = localFont({
  src: [
    { path: "./fonts/ibm-plex-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/ibm-plex-serif-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/ibm-plex-serif-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  display: "swap",
  variable: "--font-serif",
});

const caveat = localFont({
  src: "./fonts/caveat-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-hand",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  weight: "100 800",
  display: "swap",
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: {
      default: t(siteConfig.title),
      template: "%s | Rusty Roboz Labs",
    },
    description: t(siteConfig.description),
  };
}

// Explicitly emit the responsive viewport meta so real mobile devices use the
// device width (instead of falling back to a ~980px desktop layout). Next adds
// a default, but declaring it here guarantees it across runtimes and builds.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Runs before paint so a saved (or OS-preferred) dark theme never flashes light.
const themeInit = `try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const t = createTranslator(locale);
  return (
    // suppressHydrationWarning: the inline theme script may add .dark to <html>
    // before React hydrates.
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${plexSerif.variable} ${caveat.variable} ${jetbrainsMono.variable} font-display`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <a className="skip-link" href="#main-content">
          {t("Skip to main content")}
        </a>
        {/* overflow-x: clip (not hidden) keeps rotated cards from causing a
            horizontal scrollbar without turning this into a scroll container —
            which would break position: sticky on the timeline. */}
        <LanguageProvider locale={locale}>
          <div className="theme-fade min-h-screen overflow-x-clip bg-background">
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
