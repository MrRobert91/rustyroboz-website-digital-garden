import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
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
    expect(screen.getByRole("button", { name: /preguntar/i })).toBeInTheDocument();
  });

  it("handles a successful streaming response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        body: buildStreamResponse([
          'event: chunk\ndata: {"delta":"AI Safety Evals Workbench es una plataforma para evaluaciones.","session_id":1}\n\n',
          'event: done\ndata: {"answer":"AI Safety Evals Workbench es una plataforma para evaluaciones.","citations":[{"slug":"ai-safety-evals-workbench","href":"/projects/ai-safety-evals-workbench","title":"AI Safety Evals Workbench"}],"session_id":1}\n\n',
        ]),
      }),
    );

    render(<ChatExperience apiBaseUrl="http://localhost:8000" />);
    fireEvent.change(screen.getByLabelText(/pregunta/i), { target: { value: "¿Qué es AI Safety Evals Workbench?" } });
    fireEvent.click(screen.getByRole("button", { name: /preguntar/i }));

    expect(screen.getByRole("button", { name: /preguntando/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/plataforma para evaluaciones/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /ai safety evals workbench/i })).toHaveAttribute(
      "href",
      "/projects/ai-safety-evals-workbench",
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
    fireEvent.click(screen.getByRole("button", { name: /preguntar/i }));

    await waitFor(() => {
      expect(screen.getByText(/backend failure/i)).toBeInTheDocument();
    });
  });
});

