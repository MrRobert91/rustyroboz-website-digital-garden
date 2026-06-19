import Link from "next/link";
import { CoffeeRing, InkStamp, Squiggle, Tape } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

const BRIEF_LINES = [
  "What are you trying to build?",
  "What's broken right now?",
  "When does it need to ship?",
  "How can I reach you?",
];

/** Turn a social URL into a short notebook-style handle. */
function handleFor(href: string, label: string) {
  try {
    const { hostname, pathname } = new URL(href);
    const path = pathname.replace(/\/$/, "");
    const atStyle = /instagram|medium/.test(hostname);
    return atStyle ? `@${path.split("/").filter(Boolean).pop()}` : path || hostname;
  } catch {
    return label;
  }
}

/** Screen 06 — Contact / Signal. */
export function ContactSignal() {
  const email = siteConfig.email || "hello@rustyroboz.com";

  return (
    <section className="ruled-paper relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§06 — Signal</p>
            <h2 className="mt-2 font-display text-6xl font-bold leading-[0.95] tracking-tight text-foreground lg:text-8xl">
              Let&apos;s
              <br />
              <span className="relative inline-block">
                <span className="font-serif italic font-normal text-accent">build</span>
                <span className="absolute -bottom-2 left-0 hidden sm:block">
                  <Squiggle color="hsl(var(--accent))" height={14} seed={5} strokeWidth={3} width={240} />
                </span>
              </span>{" "}
              something
              <br />
              rusty.
            </h2>
          </div>
          <div className="mt-4">
            <InkStamp angle={6} label="OPEN FOR WORK" style={{ fontSize: 13, padding: "8px 14px" }} />
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          {/* left: pitch + channels */}
          <div>
            <p className="font-serif text-xl leading-relaxed text-foreground/85">
              I take on a small number of contracts and collaborations each quarter. Send me a brief: what&apos;s broken,
              what&apos;s missing, what needs to ship.
            </p>

            <div className="mt-9">
              <a className="inline-block font-hand text-3xl text-accent-deep -rotate-1 hover:text-accent" href={`mailto:${email}`}>
                {email}
              </a>
              <Squiggle className="mt-1" color="hsl(var(--accent))" height={10} seed={6} strokeWidth={2} width={320} />
            </div>

            <div className="mt-11">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">▸ or find me at</p>
              <ul className="grid gap-3.5">
                {siteConfig.socialLinks.map((link) => (
                  <li className="flex items-baseline gap-4 border-b border-dashed border-border pb-2.5" key={link.href}>
                    <Link
                      className="group flex flex-1 items-baseline gap-4"
                      href={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="w-24 font-mono text-[13px] uppercase tracking-[0.18em] text-muted-foreground">
                        {link.label}
                      </span>
                      <span className="font-hand text-2xl text-foreground transition-colors group-hover:text-accent">
                        {handleFor(link.href, link.label)}
                      </span>
                      <span className="ml-auto font-mono text-[11px] tracking-[0.16em] text-accent">OPEN ↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* right: handwritten brief card */}
          <div className="relative rotate-1 border border-border bg-paper-2 p-8 shadow-soft">
            <Tape angle={-4} height={24} style={{ top: -12, left: "50%", marginLeft: -70 }} width={140} />
            <p className="mb-3 font-hand text-2xl text-accent-deep">quick brief —</p>
            <div className="font-hand text-xl leading-relaxed text-foreground">
              {BRIEF_LINES.map((line) => (
                <div className="mb-5" key={line}>
                  <p className="m-0">{line}</p>
                  <div className="mt-1 h-6 border-b border-dashed border-border" />
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <a className="inline-flex" href={`mailto:${email}`}>
                <span className="bg-accent px-5 py-3 font-mono text-[13px] font-semibold uppercase tracking-[0.16em] text-[#fdf6ea] shadow-paper">
                  Send brief →
                </span>
              </a>
              <span className="font-hand text-lg text-muted-foreground">or just email me ↗</span>
            </div>
            <CoffeeRing size={84} style={{ bottom: -28, right: -10, opacity: 0.55 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
