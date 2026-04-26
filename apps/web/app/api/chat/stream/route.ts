const DEFAULT_API_BASE_URL = "http://localhost:8000";

export const runtime = "nodejs";

function getRawApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function buildUpstreamUrl() {
  const rawBaseUrl = getRawApiBaseUrl().trim();

  try {
    return new URL("/api/v1/chat/stream", rawBaseUrl).toString();
  } catch {
    throw new Error(`API_BASE_URL is not a valid URL: "${rawBaseUrl}". Include the protocol, for example https://your-api.sliplane.app`);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const upstreamUrl = buildUpstreamUrl();

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    if (!upstream.ok) {
      const payload = await upstream.text();
      return new Response(payload || JSON.stringify({ detail: "The chat backend returned an error." }), {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
      });
    }

    if (!upstream.body) {
      return Response.json({ detail: "The chat backend did not return a stream." }, { status: 502 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Could not contact the chat backend.";
    return Response.json({ detail }, { status: 502 });
  }
}
