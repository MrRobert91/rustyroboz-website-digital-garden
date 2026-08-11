import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST, resetContactRateLimitForTests } from "@/app/api/contact/route";

const valid = {
  name: "David Example",
  email: "david@example.com",
  project: "An accessible product discovery project.",
  service: "consulting",
  timeline: "Next month",
  message: "I would like to discuss scope, delivery, and accessibility.",
  company: "",
};

function request(body: unknown, address = "203.0.113.10") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": address },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetContactRateLimitForTests();
  process.env.CONTACT_WEBHOOK_URL = "https://provider.example/contact";
  process.env.CONTACT_WEBHOOK_TOKEN = "secret";
});

afterEach(() => {
  delete process.env.CONTACT_WEBHOOK_URL;
  delete process.env.CONTACT_WEBHOOK_TOKEN;
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("delivers a validated submission without exposing provider configuration", async () => {
    const delivery = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", delivery);

    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(delivery).toHaveBeenCalledOnce();
    expect(delivery.mock.calls[0][0]).toBe("https://provider.example/contact");
    expect(delivery.mock.calls[0][1].headers.Authorization).toBe("Bearer secret");
  });

  it.each([
    [{ ...valid, name: "" }, "name"],
    [{ ...valid, email: "not-an-email" }, "email"],
    [{ ...valid, service: "unknown" }, "service"],
  ])("returns associated validation errors", async (payload, field) => {
    vi.stubGlobal("fetch", vi.fn());
    const response = await POST(request(payload));
    expect(response.status).toBe(422);
    expect((await response.json()).errors).toHaveProperty(field);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts the honeypot generically without contacting the provider", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const response = await POST(request({ ...valid, company: "spam.example" }));
    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects an oversized request", async () => {
    const response = await POST(request({ ...valid, message: "x".repeat(17_000) }));
    expect(response.status).toBe(413);
  });

  it("limits repeated requests per client address", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    for (let index = 0; index < 5; index += 1) {
      expect((await POST(request(valid))).status).toBe(200);
    }
    expect((await POST(request(valid))).status).toBe(429);
  });

  it("fails safely when configuration or delivery is unavailable", async () => {
    delete process.env.CONTACT_WEBHOOK_URL;
    expect((await POST(request(valid))).status).toBe(503);

    resetContactRateLimitForTests();
    process.env.CONTACT_WEBHOOK_URL = "https://provider.example/contact";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect((await POST(request(valid))).status).toBe(502);
  });
});
