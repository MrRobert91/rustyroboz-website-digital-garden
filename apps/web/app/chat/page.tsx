import { ChatExperience } from "@/components/chat-experience";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";

export default async function ChatPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <Badge>Chat personal</Badge>
      <h1 className="mt-6 font-manrope text-5xl font-semibold tracking-tight text-foreground">Chat personal</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
        Un MVP de asistente conectado al contenido del sitio. Responde sobre proyectos, artículos, notas y trayectoria a
        partir del índice local construido sobre SQLite y FAISS.
      </p>
      <div className="mt-10">
        <ChatExperience apiBaseUrl={siteConfig.apiBaseUrl} />
      </div>
    </section>
  );
}

