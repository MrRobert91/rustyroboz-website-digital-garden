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
  const [projects, articles, notes] = await Promise.all([
    getFeaturedItems("projects", 2),
    getFeaturedItems("articles", 2),
    getFeaturedItems("notes", 2),
  ]);

  return (
    <>
      <ContentHero
        description="Diseño experiencias web y sistemas de IA que se pueden mantener, desplegar y explicar con claridad. Este sitio combina portfolio, blog, digital garden y laboratorio."
        eyebrow="Personal Web + AI Lab"
        primaryLink={{ href: "/projects", label: "Ver proyectos" }}
        secondaryLink={{ href: "/articles", label: "Leer artículos" }}
        title="Diseño, sistemas e IA aplicada."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <SectionHeading
          description="Una selección breve de piezas donde conviven criterio técnico, producto y detalle editorial."
          eyebrow="Trabajo seleccionado"
          title="Proyectos construidos para durar"
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
            description="Artículos y notas para pensar en voz alta sobre sistemas complejos, ética, delivery y herramientas de IA."
            eyebrow="Editorial"
            title="Una capa pública de pensamiento"
          />
          <div className="grid gap-6">
            {[...articles, ...notes].map((item, index) => (
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
            description="Producto, ingeniería e investigación aplicada son el eje. Me interesa construir software útil sin perder estructura ni criterio."
            eyebrow="Sobre mí"
            title="Entre producto, ingeniería e investigación aplicada"
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
              El laboratorio y el chat personal están visibles desde ya, pero los activarás sobre una base sólida.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-background/72">
              Frontend y backend viven en contenedores distintos, el contenido reside en MDX y la capa persistente queda lista
              para evolucionar hacia RAG con SQLite y FAISS.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
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

