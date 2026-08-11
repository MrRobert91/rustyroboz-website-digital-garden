import type { Metadata } from "next";
import { ContactSignal } from "@/components/sections/contact-signal";
import { firstPublicImage } from "@/lib/public-image";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact David Robert about AI consulting, training, or product development.",
};

export default function ContactPage() {
  const photo = firstPublicImage("/images/contact/portrait.jpg", "/images/contact/portrait.png");
  return <ContactSignal photo={photo} />;
}
