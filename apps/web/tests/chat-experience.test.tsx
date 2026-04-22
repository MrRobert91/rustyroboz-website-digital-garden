import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ChatExperience } from "@/components/chat-experience";

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
  it("renders an interactive chat form", () => {
    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    expect(screen.getByLabelText(/pregunta/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("handles a successful streaming response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: buildStreamResponse([
          'event: chunk\ndata: {"delta":"Technical Interview Chatbot es un asistente para practicar entrevistas.","session_id":1}\n\n',
          'event: done\ndata: {"answer":"Technical Interview Chatbot es un asistente para practicar entrevistas.","citations":[{"slug":"technical-interview-chatbot","href":"/projects/technical-interview-chatbot","title":"Technical Interview Chatbot"}],"session_id":1}\n\n',
        ]),
      }),
    );

    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    fireEvent.change(screen.getByLabelText(/pregunta/i), { target: { value: "¿Qué es el Technical Interview Chatbot?" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    expect(screen.getByRole("button", { name: /preguntando/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/practicar entrevistas/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /technical interview chatbot/i })).toHaveAttribute(
      "href",
      "/projects/technical-interview-chatbot",
    );
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
    fireEvent.change(screen.getByLabelText(/pregunta/i), { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/backend failure/i)).toBeInTheDocument();
    });
  });

  it("shows stream errors emitted by the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: buildStreamResponse(['event: error\ndata: {"detail":"OpenRouter devolvió 429: rate limit"}\n\n']),
      }),
    );

    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    fireEvent.change(screen.getByLabelText(/pregunta/i), { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/rate limit/i)).toBeInTheDocument();
    });
  });
});
