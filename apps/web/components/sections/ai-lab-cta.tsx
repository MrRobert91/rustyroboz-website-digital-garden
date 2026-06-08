import Link from "next/link";
import { Doodle, InkStamp } from "@/components/notebook";

const LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/lab", label: "Explore the Lab" },
  { href: "/chat", label: "Open Chat" },
];

/** Dark "workshop bench" CTA for the AI Lab layer. */
export function AiLabCta() {
  return (
    <section className="relative overflow-hidden border-t border-border/80 bg-[#241f18] text-[#f3ead6]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(#f3ead6 1px, transparent 1.4px)", backgroundSize: "26px 26px" }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16 lg:py-24">
        <div>
          <div className="flex items-center gap-3">
            <InkStamp angle={-5} label="AI Lab" style={{ borderColor: "#d8784f", color: "#e89368" }} />
            <Doodle color="#e89368" kind="bolt" size={28} />
          </div>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight lg:text-5xl">
            An evolving AI layer for retrieval, conversational interfaces, and small product experiments.
          </h2>
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-[#f3ead6]/75">
            The frontend and backend deploy independently, the content lives in MDX, and the retrieval pipeline is ready
            to grow with the site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {LINKS.map((link) => (
            <Link
              className="rounded-full border border-[#f3ead6]/30 px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] transition-colors hover:border-[#e89368] hover:text-[#e89368]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
