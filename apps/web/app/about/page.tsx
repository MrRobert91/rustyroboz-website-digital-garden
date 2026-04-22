import { ContentDetailPage } from "@/components/content-detail-page";
import { getItemBySlug, getRelatedContent } from "@/lib/content";

export default async function AboutPage() {
  const aboutPage = await getItemBySlug("pages", "about");
  const related = await getRelatedContent(aboutPage);
  return <ContentDetailPage item={aboutPage} related={related} />;
}
