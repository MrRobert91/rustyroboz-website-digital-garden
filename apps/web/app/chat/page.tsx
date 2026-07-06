import { ChatExperience } from "@/components/chat-experience";
import { Squiggle } from "@/components/notebook";

export default async function ChatPage() {
  return (
    <section className="dotted-paper relative overflow-hidden border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§ Lab — RAG Agent</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
          Personal Chat <span className="font-hand font-normal text-accent">(ask ROBOZ)</span>
        </h1>
        <Squiggle className="mt-3" color="hsl(var(--accent))" height={12} seed={9} strokeWidth={2.5} width={300} />
        <p className="mt-5 max-w-3xl font-serif text-lg leading-8 text-muted-foreground">
          A LangGraph agent with agentic search over everything published here: it queries a FAISS semantic index,
          reads full articles and projects when it needs more depth, and answers with sources — streaming from
          OpenRouter with an automatic model fallback you can see.
        </p>
        <div className="mt-12">
          <ChatExperience />
        </div>
      </div>
    </section>
  );
}
