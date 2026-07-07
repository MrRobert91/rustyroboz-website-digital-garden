"use client";

/**
 * Personal chat — notebook-styled front end for the LangGraph RAG agent.
 *
 * Consumes the API's SSE protocol:
 *   status → agent progress ("searching…", "reading…") drives the robot mood
 *   meta   → which model is answering (fallback chain is visible to the user)
 *   chunk  → streamed answer tokens
 *   done   → final answer + citations + model
 *   error  → surfaced in a stamp-style alert
 */
import Link from "next/link";
import { startTransition, useRef, useState } from "react";
import { ArrowUpRight, CornerDownLeft, Zap } from "lucide-react";
import { ChatMarkdown } from "@/components/chat-markdown";
import { Squiggle, Tape } from "@/components/notebook";
import { RobozAvatar, type RobozMood } from "@/components/widgets/roboz-avatar";
import { cn } from "@/lib/utils";

type Citation = {
  slug: string;
  title: string;
  href: string;
  collection?: string;
};

type Usage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost_usd?: number;
  cached_tokens?: number;
};

type Telemetry = {
  usage?: Usage;
  tps?: number;
  durationS?: number;
  llmCalls?: number;
  toolRounds?: number;
  cached?: boolean;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  model?: string;
  telemetry?: Telemetry;
};

type ChatExperienceProps = {
  apiBaseUrl?: string;
};

type StreamEvent = {
  event: string;
  data: Record<string, unknown>;
};

const STAGE_LABELS: Record<string, (detail: string) => string> = {
  guard: () => "checking the question…",
  thinking: () => "thinking…",
  searching: (detail) => (detail ? `searching the site: “${detail}”` : "searching the site…"),
  reading: (detail) => (detail ? `reading ${detail}…` : "reading a page…"),
  browsing: () => "browsing everything published…",
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

function shortModelName(model: string) {
  const base = model.split("/").pop() ?? model;
  return base.replace(/:free$/, "");
}

function formatCost(cost?: number) {
  if (!cost) {
    return "$0";
  }
  return cost < 0.001 ? `$${cost.toFixed(6)}` : `$${cost.toFixed(4)}`;
}

const SUGGESTIONS = [
  "Which AI projects has David shipped?",
  "What has he built with LLMs and agents?",
  "What's his experience teaching AI?",
  "Tell me about his VR and game dev work",
  "What's his background and certifications?",
  "What is he exploring right now?",
  "¿Qué ha hecho con computación cuántica?",
];

export function ChatExperience({ apiBaseUrl }: ChatExperienceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [liveTps, setLiveTps] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamStatsRef = useRef<{ startedAt: number; chars: number }>({ startedAt: 0, chars: 0 });

  const mood: RobozMood = loading
    ? streaming
      ? "talking"
      : "thinking"
    : inputFocused && input.trim()
      ? "listening"
      : "idle";

  function scrollToEnd() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }

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
    setStreaming(false);
    setError(null);
    setStatusLine("checking the question…");
    setLiveTps(null);
    streamStatsRef.current = { startedAt: 0, chars: 0 };
    setMessages((current) => [...current, userMessage, { id: assistantMessageId, role: "assistant", content: "" }]);
    scrollToEnd();

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
        if (eventPayload.event === "status") {
          const stage = String(eventPayload.data.stage ?? "");
          const detail = String(eventPayload.data.detail ?? "");
          setStatusLine((STAGE_LABELS[stage] ?? (() => "working…"))(detail));
        }

        if (eventPayload.event === "meta") {
          const nextModel = String(eventPayload.data.model ?? "");
          if (nextModel) {
            setModel(nextModel);
            setMessages((current) =>
              current.map((item) => (item.id === assistantMessageId ? { ...item, model: nextModel } : item)),
            );
          }
        }

        if (eventPayload.event === "chunk") {
          const delta = String(eventPayload.data.delta ?? "");
          setStreaming(true);
          setStatusLine(null);
          // live tokens/s estimate (~4 chars per token) until the backend
          // sends the accurate value with `done`
          const stats = streamStatsRef.current;
          if (!stats.startedAt) {
            stats.startedAt = performance.now();
          }
          stats.chars += delta.length;
          const elapsed = (performance.now() - stats.startedAt) / 1000;
          if (elapsed > 0.4) {
            setLiveTps(Math.round(stats.chars / 4 / elapsed));
          }
          startTransition(() => {
            setMessages((current) =>
              current.map((item) => (item.id === assistantMessageId ? { ...item, content: `${item.content}${delta}` } : item)),
            );
            if (eventPayload.data.session_id) {
              setSessionId(String(eventPayload.data.session_id));
            }
          });
          scrollToEnd();
        }

        if (eventPayload.event === "done") {
          const answer = String(eventPayload.data.answer ?? "");
          const citations = Array.isArray(eventPayload.data.citations) ? (eventPayload.data.citations as Citation[]) : [];
          const doneModel = String(eventPayload.data.model ?? "");
          const doneTelemetry: Telemetry = {
            usage: (eventPayload.data.usage as Usage) ?? undefined,
            tps: Number(eventPayload.data.tps ?? 0) || undefined,
            durationS: Number(eventPayload.data.duration_s ?? 0) || undefined,
            llmCalls: Number(eventPayload.data.llm_calls ?? 0) || undefined,
            toolRounds: Number(eventPayload.data.tool_rounds ?? 0),
            cached: Boolean(eventPayload.data.cached),
          };

          startTransition(() => {
            setMessages((current) =>
              current.map((item) =>
                item.id === assistantMessageId
                  ? {
                      ...item,
                      content: answer,
                      citations,
                      model: doneModel || item.model,
                      telemetry: doneTelemetry,
                    }
                  : item,
              ),
            );
            if (doneModel) {
              setModel(doneModel);
            }
            setTelemetry(doneTelemetry);
            setLiveTps(null);
            if (eventPayload.data.session_id) {
              setSessionId(String(eventPayload.data.session_id));
            }
          });
          scrollToEnd();
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
      setStreaming(false);
      setStatusLine(null);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <section className="relative border border-border bg-paper-2/80 shadow-paper">
      <Tape angle={-4} height={22} style={{ top: -11, left: 40 }} width={104} />
      <Tape angle={5} className="hidden sm:block" height={22} style={{ top: -11, right: 48 }} width={88} />

      <div className="grid lg:grid-cols-[260px_1fr]">
        {/* Left rail — the robot, its status and the model that is answering */}
        <aside className="border-b border-dashed border-border/80 px-5 py-6 lg:border-b-0 lg:border-r">
          <div className="lg:sticky lg:top-24">
            <RobozAvatar className="mx-auto max-w-[220px]" mood={mood} />
            <p aria-live="polite" className="mt-3 min-h-7 text-center font-hand text-xl text-accent-deep">
              {statusLine ??
                (mood === "talking"
                  ? "explaining…"
                  : mood === "listening"
                    ? "listening…"
                    : "ask me about David's work")}
            </p>
            <div className="mt-4 space-y-2 border-t border-dashed border-border/70 pt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Model online</p>
              <p className="font-mono text-xs text-accent" title={model ?? undefined}>
                {model ? shortModelName(model) : "standby — assigned on first reply"}
              </p>

              {/* Live telemetry — this chatbot doubles as an LLM-engineering showcase */}
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Telemetry</p>
              <dl className="space-y-1 font-mono text-[11px] text-foreground/85">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">tokens in / out</dt>
                  <dd>
                    {telemetry?.usage
                      ? `${telemetry.usage.prompt_tokens ?? 0} / ${telemetry.usage.completion_tokens ?? 0}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">tokens / s</dt>
                  <dd className={liveTps ? "text-accent" : undefined}>
                    {liveTps ? `~${liveTps} (live)` : telemetry?.tps ? telemetry.tps : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">request cost</dt>
                  <dd>{telemetry?.usage ? formatCost(telemetry.usage.cost_usd) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">llm calls · tools</dt>
                  <dd>{telemetry?.llmCalls ? `${telemetry.llmCalls} · ${telemetry.toolRounds ?? 0}` : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">latency</dt>
                  <dd>{telemetry?.durationS ? `${telemetry.durationS}s` : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">cache</dt>
                  <dd className={telemetry?.cached ? "text-accent" : undefined}>
                    {telemetry ? (telemetry.cached ? "hit ⚡" : "miss") : "—"}
                  </dd>
                </div>
              </dl>

              {sessionId ? (
                <>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Session</p>
                  <p className="truncate font-mono text-[11px] text-foreground/70" title={sessionId}>
                    {sessionId.slice(0, 12)}…
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </aside>

        {/* Conversation column */}
        <div className="flex min-h-[34rem] flex-col">
          <div className="max-h-[60vh] flex-1 space-y-5 overflow-y-auto px-5 py-6 lg:px-8" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="relative border border-dashed border-border bg-background/60 px-5 py-6">
                <p className="font-serif text-base leading-relaxed text-foreground/80">
                  I&apos;m ROBOZ — I search and read everything published on this site (projects, articles, notes,
                  background) to answer with sources. Grounded answers only: if it isn&apos;t published here, I&apos;ll
                  say so.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      className="hand-chip border border-border bg-paper-2 px-3.5 py-1.5 font-hand text-lg text-foreground shadow-paper"
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      style={{ transform: `rotate(${(suggestion.length % 3) - 1}deg)` }}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                const isStreamingThis = isLast && message.role === "assistant" && loading;
                if (message.role === "user") {
                  return (
                    <article className="ml-auto max-w-[85%] sm:max-w-xl" key={message.id}>
                      <p className="text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        You
                      </p>
                      <div className="mt-1.5 border border-foreground/20 bg-foreground px-4 py-3 text-background shadow-paper">
                        <p className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed">{message.content}</p>
                      </div>
                    </article>
                  );
                }
                return (
                  <article className="max-w-[95%] sm:max-w-2xl" key={message.id}>
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Roboz</p>
                      {message.model ? (
                        <p className="font-mono text-[10px] text-muted-foreground" title={message.model}>
                          via {shortModelName(message.model)}
                        </p>
                      ) : null}
                      {message.telemetry?.usage ? (
                        <p className="font-mono text-[10px] text-muted-foreground/80">
                          {message.telemetry.usage.total_tokens ?? 0} tok
                          {message.telemetry.tps ? ` · ${message.telemetry.tps} tok/s` : ""}
                          {` · ${formatCost(message.telemetry.usage.cost_usd)}`}
                        </p>
                      ) : null}
                      {message.telemetry?.cached ? (
                        <p className="inline-flex items-center gap-0.5 font-mono text-[10px] text-accent">
                          <Zap className="size-2.5" /> cached
                        </p>
                      ) : null}
                    </div>
                    <div className="relative mt-1.5 border border-border bg-background/70 px-4 py-3 shadow-paper">
                      <div>
                        <ChatMarkdown content={message.content} />
                        {isStreamingThis && message.content ? (
                          <span aria-hidden className="ml-0.5 animate-pulse text-accent">▍</span>
                        ) : null}
                        {!message.content && isStreamingThis ? (
                          <span className="font-hand text-lg text-muted-foreground">thinking…</span>
                        ) : null}
                      </div>
                      {message.citations?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-border/70 pt-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Sources
                          </span>
                          {message.citations.map((citation) => (
                            <Link
                              className="inline-flex items-center gap-1 border border-border bg-paper-2 px-2 py-0.5 font-mono text-[11px] text-accent-deep transition-colors hover:border-accent/60 hover:text-accent"
                              href={citation.href}
                              key={`${message.id}-${citation.collection}-${citation.slug}`}
                            >
                              {citation.title}
                              <ArrowUpRight className="size-3" />
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border/80 bg-paper-2/60 px-5 py-5 lg:px-8">
            {error ? (
              <div className="mb-4 border-2 border-accent/70 bg-background/70 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-accent">
                ✱ {error}
              </div>
            ) : null}

            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground" htmlFor="chat-prompt">
                Question
              </label>
              <textarea
                className="min-h-20 w-full resize-y border border-border bg-background px-4 py-3 font-serif text-[15px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
                id="chat-prompt"
                name="prompt"
                onBlur={() => setInputFocused(false)}
                onChange={(event) => setInput(event.target.value)}
                onFocus={() => setInputFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. How did David build the Hermes agent on a Hetzner VPS?"
                value={input}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Grounded in published content · guarded against off-topic use
                </p>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 bg-accent px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#fdf6ea] shadow-paper transition-all",
                    loading || !input.trim() ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5 hover:bg-accent-deep",
                  )}
                  disabled={loading || !input.trim()}
                  type="submit"
                >
                  {loading ? "Asking…" : "Send"}
                  {!loading ? <CornerDownLeft className="size-3.5" /> : null}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-border/80 px-5 py-3 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            LangGraph agent · FAISS retrieval · OpenRouter models with fallback
          </span>
          <Squiggle color="hsl(var(--accent) / 0.5)" height={8} seed={11} strokeWidth={1.5} width={90} />
        </div>
      </div>
    </section>
  );
}
