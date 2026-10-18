import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatExperience } from "@/components/chat-experience";
import { LanguageProvider } from "@/components/language-provider";

function buildStreamResponse(lines: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ChatExperience", () => {
  it("sends the selected language and the translated suggestion to the API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        body: buildStreamResponse(['event: done\ndata: {"answer":"Proyectos publicados.","citations":[]}\n\n']),
      });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <LanguageProvider locale="es">
        <ChatExperience />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "¿Qué proyectos de IA ha publicado David?" }));
    expect(screen.getByLabelText("Pregunta")).toHaveValue("¿Qué proyectos de IA ha publicado David?");
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(screen.getByText("Proyectos publicados.")).toBeInTheDocument());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      language: "es",
      message: "¿Qué proyectos de IA ha publicado David?",
    });
  });
  it("renders an interactive chat form", () => {
    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    expect(screen.getByLabelText(/question/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    expect(screen.getByRole("log", { name: /conversation with roboz/i })).toHaveAttribute("aria-live", "polite");
  });

  it("handles a successful streaming response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: buildStreamResponse([
          'event: chunk\ndata: {"delta":"Technical Interview Chatbot is an assistant for practicing interviews.","session_id":1}\n\n',
          'event: done\ndata: {"answer":"Technical Interview Chatbot is an assistant for practicing interviews.","citations":[{"slug":"technical-interview-chatbot","href":"/projects/technical-interview-chatbot","title":"Technical Interview Chatbot"}],"session_id":1}\n\n',
        ]),
      }),
    );

    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    fireEvent.change(screen.getByLabelText(/question/i), {
      target: { value: "What is the Technical Interview Chatbot?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(screen.getByRole("button", { name: /asking/i })).toBeDisabled();
    expect(screen.getByRole("log", { name: /conversation with roboz/i })).toHaveAttribute("aria-busy", "true");

    await waitFor(() => {
      expect(screen.getByText(/practicing interviews/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /technical interview chatbot/i })).toHaveAttribute(
      "href",
      "/projects/technical-interview-chatbot",
    );
    expect(screen.getByRole("log", { name: /conversation with roboz/i })).toHaveAttribute("aria-busy", "false");
    expect(screen.getByText("Response ready.")).toHaveAttribute("aria-live", "polite");
  });

  it("shows an error state when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: "backend failure" }),
      }),
    );

    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    const prompt = screen.getByLabelText(/question/i);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/backend failure/i));
    expect(prompt).toHaveAttribute("aria-invalid", "true");
    expect(prompt).toHaveAttribute("aria-describedby", "chat-error");
  });

  it("shows stream errors emitted by the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: buildStreamResponse(['event: error\ndata: {"detail":"OpenRouter returned 429: rate limit"}\n\n']),
      }),
    );

    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/rate limit/i));
  });
});
