import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  currentPath?: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link className="flex items-baseline gap-2" href="/">
          <span className="font-hand text-2xl leading-none text-accent-deep">Rusty Roboz</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Labs</span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {siteConfig.navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                className={cn(
                  "rounded-full px-3.5 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors",
                  isActive ? "bg-accent text-[#fdf6ea]" : "text-muted-foreground hover:text-accent",
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
