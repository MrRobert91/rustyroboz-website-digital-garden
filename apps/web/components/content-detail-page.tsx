import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentCard } from "@/components/content-card";
import { MdxRenderer } from "@/components/mdx-renderer";
import { TimelineMedia } from "@/components/timeline-media";
import { getContentHref, type ContentItem } from "@/lib/content";

type ContentDetailPageProps = {
  item: ContentItem;
  related: ContentItem[];
};

function isProjectItem(item: ContentItem): item is ContentItem & { links?: Record<string, string>; tech?: string[] } {
  return item.collection === "projects";
}

/**
 * Internal cross-links between a project and its write-up. Detected by internal
 * path (not the link key, since labels vary): a project surfaces its `/articles/…`
 * links as write-ups, an article surfaces its `/projects/…` links as the project.
 */
function getCrossLinks(item: ContentItem): { href: string; label: string }[] {
  const links = (item as { links?: Record<string, string> }).links;
  if (!links) {
    return [];
  }
  const wantPrefix = item.collection === "projects" ? "/articles/" : item.collection === "articles" ? "/projects/" : null;
  if (!wantPrefix) {
    return [];
  }
  return Object.entries(links)
    .filter(([, href]) => href.startsWith(wantPrefix))
    .map(([label, href]) => ({ href, label }));
}

function isInternalCrossHref(href: string) {
  return href.startsWith("/articles/") || href.startsWith("/projects/");
}

export function ContentDetailPage({ item, related }: ContentDetailPageProps) {
  const media = item.media ?? [];
  const videos = media.filter((entry) => entry.type === "youtube");
  const images = media.filter((entry) => entry.type === "image");
  const crossLinks = getCrossLinks(item);

  return (
    <article className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
      <div className="max-w-3xl">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.collection}</Badge>
          {item.tags.map((tag) => (
            <Link href={`/tags/${tag}`} key={tag}>
              <Badge variant="outline">{tag}</Badge>
            </Link>
          ))}
        </div>
        <h1 className="mt-6 font-manrope text-4xl font-semibold tracking-tight text-foreground md:text-6xl">{item.title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{item.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.16em] text-muted-foreground">
          <span>{new Date(item.publishedAt).toLocaleDateString("en-US")}</span>
          <span>{item.readingTime}</span>
        </div>
      </div>

      {videos.length ? (
        <div className="mt-10 max-w-3xl">
          <TimelineMedia items={videos} title={item.title} />
        </div>
      ) : null}

      <Separator className="my-12" />

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          <MdxRenderer source={item.body} />
          {images.length ? (
            <div className="mt-14">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Gallery</p>
              <TimelineMedia items={images} title={item.title} />
            </div>
          ) : null}
        </div>
        <aside className="space-y-6">
          {crossLinks.length ? (
            <div className="rounded-[2rem] border-[1.5px] border-accent/40 bg-accent/5 p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                {item.collection === "projects" ? "Write-up" : "Project"}
              </p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                {crossLinks.map((link) => (
                  <Link className="font-medium text-foreground hover:text-accent" href={link.href} key={link.href}>
                    {link.label} →
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Metadata</p>
            <dl className="mt-5 grid gap-3 text-sm text-muted-foreground">
              <div className="grid gap-1">
                <dt className="font-medium text-foreground">Collection</dt>
                <dd>{item.collection}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-foreground">Slug</dt>
                <dd>{item.slug}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-medium text-foreground">Path</dt>
                <dd>{getContentHref(item)}</dd>
              </div>
              {isProjectItem(item) && item.tech?.length ? (
                <div className="grid gap-1">
                  <dt className="font-medium text-foreground">Technologies</dt>
                  <dd>{item.tech.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          {isProjectItem(item) && item.links && Object.entries(item.links).filter(([, href]) => !isInternalCrossHref(href)).length ? (
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Links</p>
              <div className="mt-5 flex flex-col gap-3 text-sm">
                {Object.entries(item.links)
                  .filter(([, href]) => !isInternalCrossHref(href))
                  .map(([label, href]) => (
                    <Link className="text-accent underline-offset-4 hover:underline" href={href} key={href} rel="noreferrer" target="_blank">
                      {label}
                    </Link>
                  ))}
              </div>
            </div>
          ) : null}
          {related.length ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Related</p>
              {related.map((entry) => (
                <ContentCard item={entry} key={`${entry.collection}-${entry.slug}`} />
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
