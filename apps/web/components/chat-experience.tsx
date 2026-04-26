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
  apiBaseUrl?: string;
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

function buildStreamUrl(apiBaseUrl?: string) {
  return apiBaseUrl ? `${apiBaseUrl}/api/v1/chat/stream` : "/api/chat/stream";
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
      const response = await fetch(buildStreamUrl(apiBaseUrl), {
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
        throw new Error("No stream was received from the backend.");
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

        if (eventPayload.event === "error") {
          throw new Error(String(eventPayload.data.detail ?? "The chat API returned an error."));
        }
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error && caughtError.message === "Failed to fetch"
          ? "Could not reach the chat backend. Check the API URL and deployment."
          : caughtError instanceof Error
            ? caughtError.message
            : "The request could not be completed.";

      setError(message);
      setMessages((current) => current.filter((item) => item.id !== assistantMessageId));
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Which AI projects have you published?",
    "Tell me about the technical interview chatbot.",
    "What kind of articles do you write?",
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
      <div className="border-b border-border px-6 py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge>Gemma 4 + RAG</Badge>
            <h2 className="mt-4 font-manrope text-3xl font-semibold tracking-tight text-foreground">
              Ask about projects, articles, or background
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              The assistant retrieves context from the local site index and generates answers with Gemma 4 through OpenRouter.
            </p>
          </div>
          {sessionId ? <Badge variant="muted">Session {sessionId}</Badge> : null}
        </div>
      </div>

      <div className="border-b border-border px-6 py-4 lg:px-8">
        <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="flex min-h-[34rem] flex-col bg-background/60">
        <div className="flex-1 space-y-5 px-6 py-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-6">
              <p className="text-base leading-7 text-muted-foreground">
                There are no messages yet. Ask a concrete question about a project, article, or note published on the site.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="outline">Local RAG</Badge>
                <Badge variant="outline">SQLite</Badge>
                <Badge variant="outline">FAISS</Badge>
                <Badge variant="outline">Gemma 4</Badge>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <article
                className={message.role === "user" ? "ml-auto max-w-3xl rounded-[1.75rem] bg-foreground px-5 py-4 text-background" : "max-w-4xl rounded-[1.75rem] border border-border bg-card px-5 py-4 text-foreground"}
                key={message.id}
              >
                <p
                  className={
                    message.role === "user"
                      ? "text-xs font-semibold uppercase tracking-[0.2em] text-background/70"
                      : "text-xs font-semibold uppercase tracking-[0.2em] text-accent"
                  }
                >
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{message.content || (loading ? "Thinking..." : "")}</p>
                {message.citations?.length ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {message.citations.map((citation) => (
                      <Link
                        className="text-sm text-accent hover:underline"
                        href={citation.href}
                        key={`${message.id}-${citation.collection}-${citation.slug}`}
                      >
                        {citation.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>

        <div className="border-t border-border bg-card px-6 py-5 lg:px-8">
          {error ? (
            <div className="mb-4 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="text-sm font-medium text-foreground" htmlFor="chat-prompt">
              Question
            </label>
            <textarea
              className="min-h-32 w-full rounded-[1.5rem] border border-border bg-background px-5 py-4 text-base text-foreground outline-none transition-colors focus:border-accent"
              id="chat-prompt"
              name="prompt"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Example: What is Personal RAG Observatory and why did you build it?"
              value={input}
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">It will answer only with content indexed from the site.</p>
              <Button disabled={loading || !input.trim()} type="submit">
                {loading ? "Asking..." : "Send"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
