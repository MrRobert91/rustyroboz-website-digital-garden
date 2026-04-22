from __future__ import annotations

import asyncio
import json
import re
from typing import Any, TypedDict

import httpx
from langgraph.graph import END, START, StateGraph

from .config import Settings
from .db import SqliteRepository
from .knowledge_base import KnowledgeBase, SearchResult


OUT_OF_SCOPE_MESSAGE = (
    "No tengo suficiente contexto en el contenido indexado para responder con fiabilidad. "
    "Puedo ayudarte mejor si preguntas por proyectos, artículos, notas o trayectoria publicados en la web."
)


class ChatState(TypedDict, total=False):
    message: str
    session_id: int | None
    retrieved: list[SearchResult]
    answer: str
    citations: list[dict[str, str]]


class ChatService:
    def __init__(self, settings: Settings, repository: SqliteRepository, knowledge_base: KnowledgeBase) -> None:
        self.settings = settings
        self.repository = repository
        self.knowledge_base = knowledge_base
        self.graph = self._build_graph()

    async def ask(self, message: str, session_id: int | None = None) -> dict[str, Any]:
        session_id = session_id or self.repository.create_chat_session(message)
        state = await self.graph.ainvoke({"message": message, "session_id": session_id})

        citations = state.get("citations", [])
        answer = state.get("answer", OUT_OF_SCOPE_MESSAGE)

        self.repository.append_chat_message(session_id, "user", message)
        self.repository.append_chat_message(session_id, "assistant", answer, citations)

        return {
            "session_id": session_id,
            "answer": answer,
            "citations": citations,
        }

    async def stream(self, message: str, session_id: int | None = None):
        try:
            payload = await self.ask(message, session_id)
            answer = payload["answer"]

            for start in range(0, len(answer), 48):
                chunk = answer[start : start + 48]
                event = {"delta": chunk, "session_id": payload["session_id"]}
                yield f"event: chunk\ndata: {json.dumps(event, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            yield f"event: done\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
        except Exception as exc:
            error_payload = {"detail": str(exc)}
            yield f"event: error\ndata: {json.dumps(error_payload, ensure_ascii=False)}\n\n"

    def _build_graph(self):
        graph = StateGraph(ChatState)
        graph.add_node("retrieve", self._retrieve_context)
        graph.add_node("answer", self._compose_answer)
        graph.add_edge(START, "retrieve")
        graph.add_edge("retrieve", "answer")
        graph.add_edge("answer", END)
        return graph.compile()

    def _retrieve_context(self, state: ChatState) -> ChatState:
        results = self.knowledge_base.search(state["message"], limit=4)
        return {"retrieved": results}

    async def _compose_answer(self, state: ChatState) -> ChatState:
        retrieved = state.get("retrieved", [])
        if not self._has_enough_context(state["message"], retrieved):
            return {"answer": OUT_OF_SCOPE_MESSAGE, "citations": []}

        citations = self._build_citations(retrieved)
        answer = await self._request_completion(state["message"], retrieved, citations)
        return {"answer": answer, "citations": citations}

    def _has_enough_context(self, message: str, retrieved: list[SearchResult]) -> bool:
        if not retrieved:
            return False

        query_tokens = set(re.findall(r"[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ]{3,}", message.lower()))
        primary_tokens = set(
            re.findall(
                r"[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ]{3,}",
                f"{retrieved[0].title} {retrieved[0].content}".lower(),
            )
        )
        lexical_overlap = len(query_tokens & primary_tokens)
        return retrieved[0].score >= 0.18 and lexical_overlap > 0

    def _build_citations(self, retrieved: list[SearchResult]) -> list[dict[str, str]]:
        citations: list[dict[str, str]] = []
        seen: set[tuple[str, str]] = set()

        for item in retrieved:
            key = (item.collection, item.slug)
            if key in seen:
                continue
            citations.append(
                {
                    "slug": item.slug,
                    "title": item.title,
                    "href": item.href,
                    "collection": item.collection,
                }
            )
            seen.add(key)
            if len(citations) == 3:
                break

        return citations

    async def _request_completion(
        self,
        message: str,
        retrieved: list[SearchResult],
        citations: list[dict[str, str]],
    ) -> str:
        if not self.settings.openrouter_api_key:
            raise RuntimeError("OPENROUTER_API_KEY no está configurada en la API.")

        headers = {
            "Authorization": f"Bearer {self.settings.openrouter_api_key}",
            "Content-Type": "application/json",
        }
        if self.settings.openrouter_site_url:
            headers["HTTP-Referer"] = self.settings.openrouter_site_url
        if self.settings.openrouter_site_name:
            headers["X-Title"] = self.settings.openrouter_site_name

        payload = {
            "model": self.settings.openrouter_model,
            "temperature": 0.2,
            "max_tokens": 700,
            "messages": [
                {"role": "system", "content": self._build_system_prompt()},
                {
                    "role": "user",
                    "content": self._build_user_prompt(message=message, retrieved=retrieved, citations=citations),
                },
            ],
        }

        response: httpx.Response | None = None
        retry_delays = (0.8, 1.6)

        async with httpx.AsyncClient(timeout=45.0) as client:
            for attempt in range(len(retry_delays) + 1):
                try:
                    response = await client.post(self.settings.openrouter_chat_url, headers=headers, json=payload)
                except httpx.RequestError as exc:
                    if attempt == len(retry_delays):
                        raise RuntimeError(f"No se pudo conectar con OpenRouter: {exc}") from exc
                    await asyncio.sleep(retry_delays[attempt])
                    continue

                if response.status_code not in {429, 500, 502, 503, 504} or attempt == len(retry_delays):
                    break

                retry_after = response.headers.get("retry-after")
                delay = retry_delays[attempt]
                if retry_after:
                    try:
                        delay = max(delay, float(retry_after))
                    except ValueError:
                        pass
                await asyncio.sleep(delay)

        if response is None:
            raise RuntimeError("OpenRouter no devolvió ninguna respuesta.")
        if response.status_code >= 400:
            detail = self._extract_error_detail(response)
            raise RuntimeError(f"OpenRouter devolvió {response.status_code}: {detail}")

        data = response.json()
        answer = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if not answer:
            raise RuntimeError("OpenRouter no devolvió contenido en la respuesta.")

        return answer

    def _build_system_prompt(self) -> str:
        return (
            "Eres el asistente de rustyroboz.com. "
            "Responde únicamente usando el contexto recuperado del sitio personal. "
            "No inventes proyectos, fechas, enlaces ni detalles que no aparezcan en el contexto. "
            "Si el contexto no basta para responder, di exactamente: "
            f"\"{OUT_OF_SCOPE_MESSAGE}\" "
            "Responde en español salvo que la pregunta del usuario esté claramente en otro idioma. "
            "Sé preciso, directo y útil."
        )

    def _build_user_prompt(
        self,
        message: str,
        retrieved: list[SearchResult],
        citations: list[dict[str, str]],
    ) -> str:
        context_blocks = []
        for index, item in enumerate(retrieved[:4], start=1):
            context_blocks.append(
                "\n".join(
                    [
                        f"[Documento {index}]",
                        f"Título: {item.title}",
                        f"Colección: {item.collection}",
                        f"URL: {item.href}",
                        f"Score: {item.score:.4f}",
                        "Contenido:",
                        item.content.strip(),
                    ]
                )
            )

        citation_lines = [f"- {citation['title']} ({citation['href']})" for citation in citations]

        return (
            "Pregunta del usuario:\n"
            f"{message.strip()}\n\n"
            "Contexto recuperado del índice RAG:\n"
            f"{'\n\n'.join(context_blocks)}\n\n"
            "Citas que puedes usar como referencias finales:\n"
            f"{'\n'.join(citation_lines)}\n\n"
            "Instrucciones de respuesta:\n"
            "- Prioriza la información más directamente relacionada con la pregunta.\n"
            "- Si hay varias piezas de contexto, sintetízalas sin repetir texto bruto.\n"
            "- Si no hay base suficiente, devuelve exactamente el mensaje de falta de contexto.\n"
            "- No incluyas una sección separada de citas; las citas ya se enviarán por separado en la interfaz.\n"
        )

    def _extract_error_detail(self, response: httpx.Response) -> str:
        try:
            payload = response.json()
        except ValueError:
            return response.text[:300].strip() or "error desconocido"

        if isinstance(payload, dict):
            error = payload.get("error")
            if isinstance(error, dict):
                message = error.get("message")
                if isinstance(message, str) and message.strip():
                    return message.strip()
            detail = payload.get("detail")
            if isinstance(detail, str) and detail.strip():
                return detail.strip()

        return str(payload)[:300]
