"""Thin service around the LangGraph agent: sessions, history and SSE framing.

SSE protocol consumed by the web client:
  event: status  {stage, detail, session_id}     — agent progress (guard/search/read/…)
  event: meta    {model, session_id}             — which model is answering
  event: chunk   {delta, session_id}             — streamed answer tokens
  event: done    {answer, citations, model, session_id}
  event: error   {detail}
"""

from __future__ import annotations

import json
from typing import Any

from .agent import ChatAgent
from .config import Settings
from .db import SqliteRepository
from .knowledge_base import KnowledgeBase
from .openrouter import OpenRouterClient


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


class ChatService:
    def __init__(
        self,
        settings: Settings,
        repository: SqliteRepository,
        knowledge_base: KnowledgeBase,
        client: OpenRouterClient | None = None,
    ) -> None:
        self.settings = settings
        self.repository = repository
        self.knowledge_base = knowledge_base
        self.client = client or OpenRouterClient(settings)
        self.agent = ChatAgent(settings, knowledge_base, self.client)

    def _prepare(self, message: str, session_id: int | None) -> tuple[int, dict[str, Any]]:
        session_id = session_id or self.repository.create_chat_session(message)
        history = self.repository.get_chat_messages(session_id, limit=self.settings.chat_history_limit)
        return session_id, {"user_message": message, "history": history}

    def _finalize(self, session_id: int, message: str, state: dict[str, Any]) -> dict[str, Any]:
        answer = state.get("answer", "") or ""
        citations = (state.get("citations") or [])[:4] if answer else []
        model = state.get("model", "") or ""

        self.repository.append_chat_message(session_id, "user", message)
        self.repository.append_chat_message(session_id, "assistant", answer, citations)

        return {"session_id": session_id, "answer": answer, "citations": citations, "model": model}

    async def ask(self, message: str, session_id: int | None = None) -> dict[str, Any]:
        session_id, state = self._prepare(message, session_id)
        final_state = await self.agent.graph.ainvoke(state)
        payload = self._finalize(session_id, message, final_state)
        if not payload["answer"]:
            raise RuntimeError("The agent did not produce an answer.")
        return payload

    async def stream(self, message: str, session_id: int | None = None):
        try:
            session_id, state = self._prepare(message, session_id)
            final_state: dict[str, Any] = {}

            async for mode, payload in self.agent.graph.astream(state, stream_mode=["custom", "values"]):
                if mode == "custom" and isinstance(payload, dict):
                    kind = payload.get("type")
                    if kind == "chunk":
                        yield _sse("chunk", {"delta": payload.get("delta", ""), "session_id": session_id})
                    elif kind == "meta":
                        yield _sse("meta", {"model": payload.get("model", ""), "session_id": session_id})
                    elif kind == "status":
                        yield _sse(
                            "status",
                            {
                                "stage": payload.get("stage", ""),
                                "detail": payload.get("detail", ""),
                                "session_id": session_id,
                            },
                        )
                elif mode == "values" and isinstance(payload, dict):
                    final_state = payload

            payload = self._finalize(session_id, message, final_state)
            if not payload["answer"]:
                yield _sse("error", {"detail": "The agent did not produce an answer."})
                return
            yield _sse("done", payload)
        except Exception as exc:  # surfaced to the client as an SSE error frame
            yield _sse("error", {"detail": str(exc)})
