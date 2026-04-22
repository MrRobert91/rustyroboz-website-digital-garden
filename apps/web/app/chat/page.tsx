import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ChatPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <Badge>Chat personal</Badge>
      <h1 className="mt-6 font-manrope text-5xl font-semibold tracking-tight text-foreground">Chat personal</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
        Aquí vivirá el asistente que responderá sobre proyectos, experiencia, artículos, intereses y trayectoria usando el
        contenido del repositorio como base.
      </p>
      <div className="mt-10 grid gap-4 rounded-[2rem] border border-border bg-card p-8 shadow-soft md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-accent">Estado</p>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Interfaz reservada y lista para conectarse al backend FastAPI cuando entre la fase 2.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-accent">Base técnica</p>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            SQLite para datos estructurados y FAISS persistido en disco para la futura capa vectorial.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link className={cn(buttonVariants({ variant: "default" }))} href="/articles">
          Leer contenido fuente
        </Link>
        <Link className={cn(buttonVariants({ variant: "outline" }))} href="/lab">
          Volver al AI Lab
        </Link>
      </div>
    </section>
  );
}

