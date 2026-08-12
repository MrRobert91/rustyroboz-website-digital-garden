import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { InkStamp, Polaroid, Squiggle } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

/** Turn a social URL into a short notebook-style handle. */
function handleFor(href: string, label: string) {
  try {
    const { hostname, pathname } = new URL(href);
    const path = pathname.replace(/\/$/, "");
    const atStyle = /instagram|medium|x\.com|twitter/.test(hostname);
    return atStyle ? `@${path.split("/").filter(Boolean).pop()}` : path || hostname;
  } catch {
    return label;
  }
}

/** Screen 06 — Contact / Signal. */
export function ContactSignal({ photo, headingLevel = 2 }: { photo?: string; headingLevel?: 1 | 2 }) {
  const email = siteConfig.email || "hello@rustyroboz.com";
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="dotted-paper relative overflow-hidden">
      <div className="reading-surface mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">§06 — Signal</p>
            <Heading className="mt-2 font-display text-6xl font-bold leading-[0.95] tracking-tight text-foreground lg:text-8xl">
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
              together.
            </Heading>
          </div>
          <div className="mt-4 flex items-start gap-5">
            {photo ? <Polaroid alt="Portrait of David Robert." angle={4} caption="DAVID" height={150} src={photo} width={130} /> : null}
            <InkStamp angle={6} label="OPEN FOR WORK" style={{ fontSize: 14, padding: "8px 14px" }} />
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          {/* left: pitch + channels */}
          <div>
            <p className="font-serif text-xl leading-relaxed text-foreground/85">
              Got an AI-related project? I run consulting sessions to guide companies and teams through adopting
              generative AI — for every kind of profile, developers and non-developers alike. I also deliver AI
              trainings, technical consulting where you walk me through your case and I advise you, or hands-on
              development projects. Right now I&apos;m especially into building LLM-based AI agents, but I&apos;m also up
              for smaller projects of other kinds — VR, web apps, Android apps, computer vision, data science, and more.
            </p>
            <p className="mt-5 font-serif text-xl leading-relaxed text-foreground/85">
              The easiest way to start is a quick email — tell me a bit about what you have in mind and I&apos;ll get
              back to you.
            </p>

            <div className="mt-9">
              <a className="interactive-link inline-block font-serif text-xl font-semibold text-accent-deep underline decoration-2 underline-offset-8 hover:text-accent" href={`mailto:${email}`}>
                {email}
              </a>
              <Squiggle className="mt-1" color="hsl(var(--accent))" height={10} seed={6} strokeWidth={2} width={320} />
            </div>

            <div className="mt-11">
              <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">▸ or find me at</p>
              <ul className="grid gap-3.5">
                {siteConfig.socialLinks.map((link) => (
                  <li className="flex items-baseline gap-4 border-b border-dashed border-border pb-2.5" key={link.href}>
                    <Link
                      className="interactive-link group flex flex-1 items-baseline gap-4"
                      href={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="w-24 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
                        {link.label}
                      </span>
                      <span className="font-serif text-lg text-foreground transition-colors group-hover:text-accent group-hover:underline">
                        {handleFor(link.href, link.label)}
                      </span>
                      <span className="ml-auto font-mono text-sm tracking-[0.16em] text-accent">OPEN ↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
