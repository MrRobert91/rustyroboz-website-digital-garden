const DEFAULT_API_BASE_URL = "http://localhost:8000";

export const runtime = "nodejs";

function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export async function POST(request: Request) {
  const body = await request.text();
  const upstreamUrl = new URL("/api/v1/chat/stream", getApiBaseUrl()).toString();

  try {
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
      return new Response(payload || JSON.stringify({ detail: "El backend del chat devolvió un error." }), {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
      });
    }

    if (!upstream.body) {
      return Response.json({ detail: "El backend del chat no devolvió stream." }, { status: 502 });
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
    const detail = error instanceof Error ? error.message : "No se pudo contactar con el backend del chat.";
    return Response.json({ detail }, { status: 502 });
  }
}
