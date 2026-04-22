import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  currentPath?: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link className="font-manrope text-sm font-semibold uppercase tracking-[0.22em] text-foreground" href="/">
          {siteConfig.name}
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {siteConfig.navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

