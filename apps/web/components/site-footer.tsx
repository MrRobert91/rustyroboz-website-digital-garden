import Link from "next/link";
import { Doodle } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-xl">
          <p className="font-serif text-3xl italic text-foreground">
            Projects, articles, and experiments by {siteConfig.name}.
          </p>
          <p className="mt-3 font-serif text-sm leading-6 text-muted-foreground">
            A personal site for software, AI systems, games, and technical writing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {siteConfig.socialLinks.map((link) => (
            <Link
              className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent"
              href={link.href}
              key={link.href}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 pb-8 lg:px-10">
        <Doodle color="hsl(var(--accent-deep))" kind="gear" size={26} />
        <span className="font-hand text-lg text-muted-foreground">© 2026 — rusty roboz labs · drawn in madrid</span>
      </div>
    </footer>
  );
}
