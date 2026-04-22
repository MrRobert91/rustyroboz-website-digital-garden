import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LabPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <Badge>AI Lab</Badge>
      <h1 className="mt-6 font-manrope text-5xl font-semibold tracking-tight text-foreground">AI Lab</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
        Esta ruta queda visible desde la primera versión para reservar el espacio del laboratorio: demos, evaluaciones,
        interfaces conversacionales y pequeños experimentos de producto.
      </p>
      <div className="mt-10 rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.22em] text-accent">Coming soon</p>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          La siguiente fase activará chat, retrieval y streaming sobre la misma arquitectura desacoplada que ya sostiene el
          sitio público.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link className={cn(buttonVariants({ variant: "default" }))} href="/projects">
          Ver proyectos
        </Link>
        <Link className={cn(buttonVariants({ variant: "outline" }))} href="/chat">
          Ver teaser del chat
        </Link>
      </div>
    </section>
  );
}

