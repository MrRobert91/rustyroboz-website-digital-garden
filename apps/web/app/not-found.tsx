import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
      <p className="text-sm uppercase tracking-[0.24em] text-accent">404</p>
      <h1 className="mt-6 font-manrope text-5xl font-semibold tracking-tight">No encontré esa página.</h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        Puede que el contenido se haya movido o que el slug no exista todavía.
      </p>
      <Link className="mt-8 inline-flex text-accent hover:underline" href="/">
        Volver al inicio
      </Link>
    </div>
  );
}

