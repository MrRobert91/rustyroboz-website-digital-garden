import { ContentCard } from "@/components/content-card";
import { SectionHeading } from "@/components/section-heading";
import type { ContentItem } from "@/lib/content";

type ContentListPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: ContentItem[];
  notebookFrame?: boolean;
};

export function ContentListPage({ eyebrow, title, description, items, notebookFrame = false }: ContentListPageProps) {
  const content = (
    <>
      <SectionHeading description={description} eyebrow={eyebrow} headingLevel={1} title={title} />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <ContentCard item={item} key={`${item.collection}-${item.slug}`} />
        ))}
      </div>
    </>
  );

  if (notebookFrame) {
    return (
      <section className="dotted-paper relative overflow-hidden border-b border-border/70">
        <div className="reading-surface mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">{content}</div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
      {content}
    </div>
  );
}
