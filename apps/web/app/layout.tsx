import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, IBM_Plex_Serif, Caveat, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hand",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline theme script may add .dark to <html>
    // before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${plexSerif.variable} ${caveat.variable} ${jetbrainsMono.variable} font-display`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {/* overflow-x: clip (not hidden) keeps rotated cards from causing a
            horizontal scrollbar without turning this into a scroll container —
            which would break position: sticky on the timeline. */}
        <div className="theme-fade min-h-screen overflow-x-clip bg-background bg-paper-grid">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
