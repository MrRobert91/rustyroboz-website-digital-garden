import { ContentDetailPage } from "@/components/content-detail-page";
import { getItemBySlug, getRelatedContent } from "@/lib/content";

export default async function ContactPage() {
  const contactPage = await getItemBySlug("pages", "contact");
  const related = await getRelatedContent(contactPage);
  return <ContentDetailPage item={contactPage} related={related} />;
}
