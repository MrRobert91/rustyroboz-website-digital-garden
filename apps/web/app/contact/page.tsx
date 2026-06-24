import { ContactSignal } from "@/components/sections/contact-signal";
import { firstPublicImage } from "@/lib/public-image";

export default function ContactPage() {
  const photo = firstPublicImage("/images/contact/portrait.jpg", "/images/contact/portrait.png");
  return <ContactSignal photo={photo} />;
}
