import { ChatExperience } from "@/components/chat-experience";
import { Badge } from "@/components/ui/badge";

export default async function ChatPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
      <Badge>Personal Chat</Badge>
      <h1 className="mt-6 font-manrope text-5xl font-semibold tracking-tight text-foreground">Personal Chat</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
        An assistant connected to the site content. It retrieves context from the local index built with SQLite and FAISS and
        generates answers with Gemma 4.
      </p>
      <div className="mt-10">
        <ChatExperience />
      </div>
    </section>
  );
}
