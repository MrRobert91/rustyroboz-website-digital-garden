import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type ContentHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLink: { href: string; label: string };
  secondaryLink?: { href: string; label: string };
};

export function ContentHero({ eyebrow, title, description, primaryLink, secondaryLink }: ContentHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-hero-texture">
      <div className="mx-auto grid min-h-[calc(100svh-73px)] max-w-6xl items-end gap-12 px-6 py-16 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-20">
        <Reveal className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
          <h1 className="mt-6 max-w-4xl font-manrope text-5xl font-semibold tracking-[-0.04em] text-foreground md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link className={cn(buttonVariants({ variant: "default" }))} href={primaryLink.href}>
              {primaryLink.label}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            {secondaryLink ? (
              <Link className={cn(buttonVariants({ variant: "outline" }))} href={secondaryLink.href}>
                {secondaryLink.label}
              </Link>
            ) : null}
          </div>
        </Reveal>
        <Reveal className="self-stretch" delay={0.1}>
          <div className="relative h-full min-h-80 rounded-[2rem] border border-border bg-card/90 p-6 shadow-soft">
            <div className="grid h-full content-between gap-8">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Signal</p>
                <ul className="mt-6 flex flex-col gap-5 text-base leading-7 text-foreground">
                  <li>Portfolio para proyectos con criterio técnico y de producto.</li>
                  <li>Blog y notas enlazadas por tags para pensar en público.</li>
                  <li>AI Lab y chat personal preparados para crecer sin rehacer la base.</li>
                </ul>
              </div>
              <div className="grid gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
                <span>Diseño editorial + infraestructura desacoplada.</span>
                <span>Frontend y backend desplegables por separado.</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

