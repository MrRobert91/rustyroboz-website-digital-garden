import { ContentCard } from "@/components/content-card";
import { SectionHeading } from "@/components/section-heading";
import { getEntriesByTag, getTagIndex } from "@/lib/content";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getTagIndex();
  return [...tags.keys()].map((tag) => ({ tag }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const items = await getEntriesByTag(tag);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
      <SectionHeading
        description="A cross-section of projects, articles, and notes related by topic."
        eyebrow="Tags"
        title={`Tag: ${tag}`}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <ContentCard item={item} key={`${item.collection}-${item.slug}`} />
        ))}
      </div>
    </div>
  );
}
