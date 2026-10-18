import { getTranslation } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ContentCard } from "@/components/content-card";
import { SectionHeading } from "@/components/section-heading";
import { getEntriesByTag, getTagIndex } from "@/lib/content";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getTagIndex("en");
  return [...tags.keys()].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const t = await getTranslation();
  const { tag } = await params;
  return {
    title: `${t("Tag:")} ${tag}`,
    description: `${t("Projects, articles, and notes tagged")} ${tag}.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const t = await getTranslation();
  const { tag } = await params;
  const items = await getEntriesByTag(tag);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
      <SectionHeading
        description="A cross-section of projects, articles, and notes related by topic."
        eyebrow="Tags"
        headingLevel={1}
        title={`${t("Tag:")} ${tag}`}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <ContentCard item={item} key={`${item.collection}-${item.slug}`} />
        ))}
      </div>
    </div>
  );
}
