"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll and allow Escape to close while the menu is open.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6 lg:px-10 lg:py-4">
        <Link className="flex items-baseline gap-2" href="/" onClick={() => setOpen(false)}>
          <span className="font-hand text-3xl font-semibold leading-none text-accent-deep">Rusty Roboz</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Labs</span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              className={cn(
                "rounded-full px-3.5 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors",
                isActive(item.href) ? "bg-accent text-[#fdf6ea]" : "text-muted-foreground hover:text-accent",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          aria-controls="mobile-nav"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-1 grid size-11 place-items-center rounded-full text-foreground transition-colors hover:text-accent md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile navigation panel */}
      <div
        className={cn(
          "border-border/70 bg-background/95 backdrop-blur md:hidden",
          open ? "block animate-menu-down border-b" : "hidden",
        )}
        id="mobile-nav"
      >
        <nav aria-label="Mobile navigation" className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-6">
          {siteConfig.navigation.map((item) => (
            <Link
              className={cn(
                "flex items-center justify-between border-b border-dashed border-border/60 py-3.5 font-mono text-sm uppercase tracking-[0.16em] transition-colors last:border-b-0",
                isActive(item.href) ? "text-accent" : "text-foreground/80 hover:text-accent",
              )}
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
              {isActive(item.href) ? <span aria-hidden className="text-accent">●</span> : null}
            </Link>
          ))}
          <div className="flex flex-wrap gap-x-5 gap-y-2 pb-4 pt-4">
            {siteConfig.socialLinks.map((link) => (
              <a
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent"
                href={link.href}
                key={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
