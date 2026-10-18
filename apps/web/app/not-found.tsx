import { getTranslation } from "@/lib/i18n/server";
import { Text } from "@/components/language-provider";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: t("Page not found"),
  };
}

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-10">
      <p className="text-sm uppercase tracking-[0.24em] text-accent">404</p>
      <h1 className="mt-6 font-manrope text-5xl font-semibold tracking-tight">
        <Text>No encontré esa página.</Text>
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        <Text>Puede que el contenido se haya movido o que el slug no exista todavía.</Text>
      </p>
      <Link className="text-link mt-8 inline-flex" href="/">
        <Text>Volver al inicio</Text>
      </Link>
    </div>
  );
}
