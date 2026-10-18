import { getTranslation } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ContactSignal } from "@/components/sections/contact-signal";
import { firstPublicImage } from "@/lib/public-image";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: t("Contact"),
    description: t("Contact David Robert about AI consulting, training, or product development."),
  };
}

export default function ContactPage() {
  const photo = firstPublicImage("/images/contact/portrait.jpg", "/images/contact/portrait.png");
  return <ContactSignal headingLevel={1} photo={photo} />;
}
