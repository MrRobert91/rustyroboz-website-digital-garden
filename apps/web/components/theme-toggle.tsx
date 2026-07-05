"use client";

/**
 * Day workshop / night workshop switch. The .dark palette already lives in
 * globals.css — this just flips the class on <html> and remembers the choice.
 * Icon visibility is pure CSS (dark:) so there is no hydration flicker.
 */
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // private mode — theme just won't persist
    }
  };

  return (
    <button
      aria-label="Toggle between day and night workshop"
      className="grid size-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-accent/60 hover:text-accent"
      onClick={toggle}
      title="Lights on / lights off"
      type="button"
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
