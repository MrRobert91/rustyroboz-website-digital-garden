import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/chat/stream/route";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.API_BASE_URL;
  delete process.env.NEXT_PUBLIC_API_BASE_URL;
});

describe("chat stream proxy route", () => {
  it("returns a diagnostic 502 when API_BASE_URL is invalid", async () => {
    process.env.API_BASE_URL = "api-service-without-protocol";

    const response = await POST(new Request("http://localhost/api/chat/stream", { method: "POST", body: "{}" }));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.detail).toMatch(/API_BASE_URL no es una URL válida/i);
  });

  it("proxies the request to the configured backend", async () => {
    process.env.API_BASE_URL = "https://api.example.com";
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("event: done\n"));
        controller.close();
      },
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body,
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(new Request("http://localhost/api/chat/stream", { method: "POST", body: "{}" }));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/chat/stream",
      expect.objectContaining({ method: "POST", body: "{}" }),
    );
  });
});
