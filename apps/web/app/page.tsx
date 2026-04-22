import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { ContentHero } from "@/components/content-hero";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedItems } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [projects, articles] = await Promise.all([getFeaturedItems("projects", 2), getFeaturedItems("articles", 2)]);

  return (
    <>
      <ContentHero
        description="My name is David Robert. This site brings together the projects, articles and experiments from the previous Rustyroboz web and Medium archive."
        eyebrow="Rustyroboz Archive"
        primaryLink={{ href: "/projects", label: "Ver proyectos" }}
        secondaryLink={{ href: "/articles", label: "Leer artículos" }}
        title="AI, VR, games, software and strange prototypes."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <SectionHeading
          description="A selection from the legacy portfolio, now migrated into MDX with the original project copy and images."
          eyebrow="Trabajo seleccionado"
          title="Projects from the previous Rustyroboz site"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <Reveal key={project.slug}>
              <ContentCard item={project} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border/80 bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20">
          <SectionHeading
            description="Articles migrated from Medium, covering Android publishing, data careers, generative AI, Python and game experiments."
            eyebrow="Medium Archive"
            title="Writing that now lives locally"
          />
          <div className="grid gap-6">
            {articles.map((item, index) => (
              <Reveal delay={index * 0.06} key={`${item.collection}-${item.slug}`}>
                <ContentCard item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            description="The original home page described a broad technical curiosity. This section keeps that spirit and turns it into a cleaner overview."
            eyebrow="Sobre mí"
            title="A personal archive with a clearer structure"
          />
          <div className="grid gap-5">
            {siteConfig.timeline.map((entry) => (
              <Reveal className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft" key={entry.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{entry.period}</p>
                <h3 className="mt-3 text-xl font-semibold text-foreground">{entry.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/80 bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-20">
          <div>
            <Badge className="bg-background/10 text-background" variant="default">
              AI Lab
            </Badge>
            <h2 className="mt-5 max-w-3xl font-manrope text-4xl font-semibold tracking-tight">
              The old portfolio now sits on top of a real content system, with a separate API and a personal chat layer.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-background/72">
              Frontend and backend deploy independently, content lives in MDX, and the retrieval layer is ready to keep growing
              from the migrated archive.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-background/30 text-background hover:border-background")} href="/contact">
              Contacto
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-background/30 text-background hover:border-background")} href="/lab">
              Explorar el Lab
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-background/30 text-background hover:border-background")} href="/chat">
              Abrir el chat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
