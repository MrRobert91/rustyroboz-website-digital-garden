import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-xl">
          <p className="font-newsreader text-3xl italic text-foreground">Construyo productos que pueden explicarse.</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Portfolio, artículos, notas conectadas y un laboratorio de IA en evolución.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {siteConfig.socialLinks.map((link) => (
            <Link className="text-sm text-muted-foreground transition-colors hover:text-accent" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

