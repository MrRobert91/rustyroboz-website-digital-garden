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
    expect(screen.getByLabelText(/question/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: "What is the Technical Interview Chatbot?" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(screen.getByRole("button", { name: /asking/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/practicing interviews/i)).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/question/i), { target: { value: "hello" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/backend failure/i)).toBeInTheDocument();
    });
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

    await waitFor(() => {
      expect(screen.getByText(/rate limit/i)).toBeInTheDocument();
    });
  });
});
