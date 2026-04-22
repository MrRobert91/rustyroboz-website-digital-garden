import { ContentCard } from "@/components/content-card";
import { SectionHeading } from "@/components/section-heading";
import type { ContentItem } from "@/lib/content";

type ContentListPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: ContentItem[];
};

export function ContentListPage({ eyebrow, title, description, items }: ContentListPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
      <SectionHeading description={description} eyebrow={eyebrow} title={title} />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <ContentCard item={item} key={`${item.collection}-${item.slug}`} />
        ))}
      </div>
    </div>
  );
}

