"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Citation = {
  slug: string;
  title: string;
  href: string;
  collection?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

type ChatExperienceProps = {
  apiBaseUrl: string;
};

type StreamEvent = {
  event: string;
  data: Record<string, unknown>;
};

async function* parseEventStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const lines = frame.split("\n");
      const eventLine = lines.find((line) => line.startsWith("event:"));
      const dataLine = lines.find((line) => line.startsWith("data:"));

      if (!eventLine || !dataLine) {
        continue;
      }

      yield {
        event: eventLine.replace("event:", "").trim(),
        data: JSON.parse(dataLine.replace("data:", "").trim()),
      } satisfies StreamEvent;
    }
  }
}

export function ChatExperience({ apiBaseUrl }: ChatExperienceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    };
    const assistantMessageId = `assistant-${Date.now()}`;

    setInput("");
    setLoading(true);
    setError(null);
    setMessages((current) => [...current, userMessage, { id: assistantMessageId, role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt, session_id: sessionId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(payload?.detail ?? `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No se recibió stream desde el backend.");
      }

      for await (const eventPayload of parseEventStream(response.body)) {
        if (eventPayload.event === "chunk") {
          const delta = String(eventPayload.data.delta ?? "");
          startTransition(() => {
            setMessages((current) =>
              current.map((item) => (item.id === assistantMessageId ? { ...item, content: `${item.content}${delta}` } : item)),
            );
            if (eventPayload.data.session_id) {
              setSessionId(Number(eventPayload.data.session_id));
            }
          });
        }

        if (eventPayload.event === "done") {
          const answer = String(eventPayload.data.answer ?? "");
          const citations = Array.isArray(eventPayload.data.citations) ? (eventPayload.data.citations as Citation[]) : [];

          startTransition(() => {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      content: answer,
                      citations,
                    }
                  : item,
              ),
            );
            if (eventPayload.data.session_id) {
              setSessionId(Number(eventPayload.data.session_id));
            }
          });
        }
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "No se pudo completar la solicitud.";
      setError(message);
      setMessages((current) => current.filter((item) => item.id !== assistantMessageId));
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "¿Qué es AI Safety Evals Workbench?",
    "¿Qué temas tratas en tus artículos?",
    "¿Cómo entiendes el trabajo técnico?",
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
        <Badge>Asistente</Badge>
        <h2 className="mt-5 font-manrope text-3xl font-semibold tracking-tight text-foreground">Pregunta sobre proyectos, artículos o trayectoria</h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          El asistente responde solo con contenido indexado del sitio. Si no tiene contexto suficiente, lo indica de forma explícita.
        </p>

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-foreground" htmlFor="chat-prompt">
            Pregunta
          </label>
          <textarea
            className="min-h-36 rounded-[1.5rem] border border-border bg-background px-5 py-4 text-base text-foreground outline-none transition-colors focus:border-accent"
            id="chat-prompt"
            name="prompt"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ejemplo: ¿Qué es Personal RAG Observatory y por qué lo construiste?"
            value={input}
          />
          <div className="flex flex-wrap gap-3">
            <Button disabled={loading || !input.trim()} type="submit">
              {loading ? "Preguntando..." : "Preguntar"}
            </Button>
            {suggestions.map((suggestion) => (
              <button
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                key={suggestion}
                onClick={() => setInput(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {error ? (
          <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-border bg-background p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Stream</p>
            <h2 className="mt-2 font-manrope text-2xl font-semibold text-foreground">Conversación</h2>
          </div>
          {sessionId ? <Badge variant="muted">Sesión {sessionId}</Badge> : null}
        </div>

        <div className="mt-6 flex min-h-[26rem] flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-dashed border-border p-6">
              <p className="text-base leading-7 text-muted-foreground">
                Todavía no hay mensajes. Haz una pregunta concreta sobre un proyecto, una nota o la forma en la que está pensado el sitio.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="outline">RAG local</Badge>
                <Badge variant="outline">SQLite</Badge>
                <Badge variant="outline">FAISS</Badge>
                <Badge variant="outline">LangGraph</Badge>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <article
                className={message.role === "user" ? "ml-8 rounded-[1.5rem] bg-foreground px-5 py-4 text-background" : "mr-8 rounded-[1.5rem] border border-border bg-card px-5 py-4 text-foreground"}
                key={message.id}
              >
                <p className={message.role === "user" ? "text-xs font-semibold uppercase tracking-[0.2em] text-background/70" : "text-xs font-semibold uppercase tracking-[0.2em] text-accent"}>
                  {message.role === "user" ? "Tú" : "Asistente"}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{message.content || (loading ? "Pensando..." : "")}</p>
                {message.citations?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <Link className="text-sm text-accent hover:underline" href={citation.href} key={`${message.id}-${citation.slug}`}>
                        {citation.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

