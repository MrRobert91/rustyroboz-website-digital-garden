import { NextResponse } from "next/server";
import { validateContactPayload } from "@/lib/contact";

const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT_REQUESTS = 5;
const attempts = new Map<string, number[]>();

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function rateLimited(address: string, now = Date.now()) {
  const recent = (attempts.get(address) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_REQUESTS) {
    attempts.set(address, recent);
    return true;
  }
  recent.push(now);
  attempts.set(address, recent);
  return false;
}

export function resetContactRateLimitForTests() {
  attempts.clear();
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, message: "The request is too large." }, { status: 413 });
  }

  if (rateLimited(clientAddress(request))) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, message: "The request is too large." }, { status: 413 });
  }

  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, message: "The request body is not valid JSON." }, { status: 400 });
  }

  const validation = validateContactPayload(input);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors, message: "Review the highlighted fields." }, { status: 422 });
  }
  if (validation.spam) {
    return NextResponse.json({ ok: true, message: "Thanks. Your message was received." });
  }

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, message: "Online contact is temporarily unavailable. Please use the email alternative." },
      { status: 503 },
    );
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.CONTACT_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}`;
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...validation.data, source: "rustyroboz.com/contact", submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error("Delivery provider rejected the request");
  } catch {
    return NextResponse.json(
      { ok: false, message: "The message could not be delivered. Your entries are still here; try again or use email." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, message: "Thanks. Your message was sent successfully." });
}
