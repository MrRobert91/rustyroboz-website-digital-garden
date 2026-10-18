"use client";

import { useTranslation } from "@/components/language-provider";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

type HeroFact = {
  label: string;
  value: string;
};

type ContentHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLink: { href: string; label: string };
  secondaryLink?: { href: string; label: string };
  bioTitle: string;
  bioDescription: string;
  bioFacts: HeroFact[];
};

export function ContentHero({
  eyebrow,
  title,
  description,
  primaryLink,
  secondaryLink,
  bioTitle,
  bioDescription,
  bioFacts,
}: ContentHeroProps) {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-hero-texture">
      <div className="mx-auto grid min-h-[calc(100svh-73px)] max-w-6xl items-end gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-20">
        <Reveal className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">{t(eyebrow)}</p>
          <h1 className="mt-6 max-w-4xl font-manrope text-5xl font-semibold tracking-[-0.04em] text-foreground md:text-7xl">
            {t(title)}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{t(description)}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link className={cn(buttonVariants({ variant: "default" }))} href={primaryLink.href}>
              {t(primaryLink.label)}
              <ArrowRight className="ml-2 size-4" />
            </Link>
            {secondaryLink ? (
              <Link className={cn(buttonVariants({ variant: "outline" }))} href={secondaryLink.href}>
                {t(secondaryLink.label)}
              </Link>
            ) : null}
          </div>
        </Reveal>
        <Reveal className="self-stretch" delay={0.1}>
          <div className="relative h-full min-h-80 rounded-[2rem] border border-border bg-card/90 p-6 shadow-soft">
            <div className="grid h-full content-between gap-8">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{t("About")}</p>
                <h2 className="mt-4 font-manrope text-3xl font-semibold tracking-tight text-foreground">
                  {t(bioTitle)}
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{t(bioDescription)}</p>
              </div>
              <dl className="grid gap-4 border-t border-border pt-6 text-sm">
                {bioFacts.map((fact) => (
                  <div className="grid gap-1" key={fact.label}>
                    <dt className="uppercase tracking-[0.18em] text-muted-foreground">{t(fact.label)}</dt>
                    <dd className="text-foreground">{t(fact.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
