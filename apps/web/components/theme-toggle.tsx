"use client";

/**
 * Day workshop / night workshop switch. The .dark palette already lives in
 * globals.css — this just flips the class on <html> and remembers the choice.
 * Icon visibility is pure CSS (dark:) so there is no hydration flicker.
 */
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains("dark"));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    setIsDark(dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // private mode — theme just won't persist
    }
  };

  return (
    <button
      aria-label={isDark === null ? "Change color theme" : isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark ?? undefined}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-control-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      onClick={toggle}
      title={isDark ? "Use light theme" : "Use dark theme"}
      type="button"
    >
      <Moon aria-hidden className="size-4 dark:hidden" />
      <Sun aria-hidden className="hidden size-4 dark:block" />
    </button>
  );
}
