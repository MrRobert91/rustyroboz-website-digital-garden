from __future__ import annotations

import asyncio
import json
import re
from typing import Any, TypedDict

from langgraph.graph import END, START, StateGraph

from .db import SqliteRepository
from .knowledge_base import KnowledgeBase, SearchResult


class ChatState(TypedDict, total=False):
    message: str
    session_id: int | None
    retrieved: list[SearchResult]
    answer: str
    citations: list[dict[str, str]]


class ChatService:
    def __init__(self, repository: SqliteRepository, knowledge_base: KnowledgeBase) -> None:
        self.repository = repository
        self.knowledge_base = knowledge_base
        self.graph = self._build_graph()

    async def ask(self, message: str, session_id: int | None = None) -> dict[str, Any]:
        session_id = session_id or self.repository.create_chat_session(message)
        state = await self.graph.ainvoke({"message": message, "session_id": session_id})

        citations = state.get("citations", [])
        answer = state.get("answer", "No tengo suficiente contexto para responder con fiabilidad desde el sitio.")

        self.repository.append_chat_message(session_id, "user", message)
        self.repository.append_chat_message(session_id, "assistant", answer, citations)

        return {
            "session_id": session_id,
            "answer": answer,
            "citations": citations,
        }

    async def stream(self, message: str, session_id: int | None = None):
        payload = await self.ask(message, session_id)
        answer = payload["answer"]

        for start in range(0, len(answer), 48):
            chunk = answer[start : start + 48]
            event = {"delta": chunk, "session_id": payload["session_id"]}
            yield f"event: chunk\ndata: {json.dumps(event, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0)

        yield f"event: done\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"

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

    def _compose_answer(self, state: ChatState) -> ChatState:
        retrieved = state.get("retrieved", [])
        query_tokens = set(re.findall(r"[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ]{3,}", state["message"].lower()))

        if not retrieved:
            return {
                "answer": (
                    "No tengo suficiente contexto en el contenido indexado para responder con fiabilidad. "
                    "Puedo ayudarte mejor si preguntas por proyectos, artículos, notas o trayectoria publicados en la web."
                ),
                "citations": [],
            }

        primary_tokens = set(re.findall(r"[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ]{3,}", f"{retrieved[0].title} {retrieved[0].content}".lower()))
        lexical_overlap = len(query_tokens & primary_tokens)

        if retrieved[0].score < 0.18 or lexical_overlap == 0:
            return {
                "answer": (
                    "No tengo suficiente contexto en el contenido indexado para responder con fiabilidad. "
                    "Puedo ayudarte mejor si preguntas por proyectos, artículos, notas o trayectoria publicados en la web."
                ),
                "citations": [],
            }

        citations: list[dict[str, str]] = []
        seen: set[str] = set()
        for item in retrieved:
            if item.slug in seen:
                continue
            citations.append(
                {
                    "slug": item.slug,
                    "title": item.title,
                    "href": item.href,
                    "collection": item.collection,
                }
            )
            seen.add(item.slug)
            if len(citations) == 3:
                break

        primary = retrieved[0]
        support_lines = [result.content.split("\n", 1)[-1].strip().replace("\n", " ") for result in retrieved[:2]]
        support_lines = [line[:220].strip() for line in support_lines if line]
        answer = (
            f"{primary.title} es relevante para tu pregunta. "
            f"{support_lines[0] if support_lines else primary.content[:220].strip()} "
        )
        if len(support_lines) > 1:
            answer += f"Además, el contenido relacionado refuerza que {support_lines[1]} "
        answer += "He basado esta respuesta únicamente en contenido indexado del sitio."

        return {
            "answer": answer.strip(),
            "citations": citations,
        }
