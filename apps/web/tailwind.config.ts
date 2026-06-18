import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./tests/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "paper-2": "hsl(var(--paper-2))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        "accent-deep": "hsl(var(--accent-deep))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["var(--font-display)", "Helvetica Neue", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        hand: ["var(--font-hand)", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 24px 60px -36px rgba(60, 40, 20, 0.45)",
        paper: "0 12px 24px -18px rgba(60, 40, 20, 0.4), 0 1px 0 rgba(0, 0, 0, 0.04)",
      },
      rotate: {
        "1.5": "1.5deg",
      },
    },
  },
  plugins: [],
};

export default config;
