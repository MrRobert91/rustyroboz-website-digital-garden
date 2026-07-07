"""Thin service around the LangGraph agent: sessions, history, caching and SSE framing.

SSE protocol consumed by the web client:
  event: status  {stage, detail, session_id}     — agent progress (guard/search/read/…)
  event: meta    {model, session_id}             — which model is answering
  event: chunk   {delta, session_id}             — streamed answer tokens
  event: done    {answer, citations, model, usage, tps, duration_s, llm_calls,
                  tool_rounds, cached, session_id}
  event: error   {detail}
"""

from __future__ import annotations

import json
import time
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
        # First-turn answer cache (suggested-question chips hit this a lot).
        self._answer_cache: dict[str, dict[str, Any]] = {}

    def _prepare(self, message: str, session_id: str | None) -> tuple[str, dict[str, Any], bool]:
        fresh = not (session_id and self.repository.session_exists(session_id))
        if fresh:
            session_id = self.repository.create_chat_session(message)
        history = self.repository.get_chat_messages(session_id, limit=self.settings.chat_history_limit)
        return session_id, {"user_message": message, "history": history}, fresh and not history

    def _finalize(self, session_id: str, message: str, state: dict[str, Any], started: float) -> dict[str, Any]:
        answer = state.get("answer", "") or ""
        citations = (state.get("citations") or [])[:4] if answer else []
        model = state.get("model", "") or ""
        usage = state.get("usage") or {}

        self.repository.append_chat_message(session_id, "user", message)
        self.repository.append_chat_message(session_id, "assistant", answer, citations)

        return {
            "session_id": session_id,
            "answer": answer,
            "citations": citations,
            "model": model,
            "usage": usage,
            "tps": state.get("tps", 0.0),
            "duration_s": round(time.time() - started, 2),
            "llm_calls": state.get("llm_calls", 0),
            "tool_rounds": state.get("tool_rounds", 0),
            "cached": False,
        }

    # ---- first-turn answer cache ----

    @staticmethod
    def _cache_key(message: str) -> str:
        return " ".join(message.lower().split())

    def _cache_get(self, message: str) -> dict[str, Any] | None:
        entry = self._answer_cache.get(self._cache_key(message))
        if not entry:
            return None
        if time.time() - entry["at"] > self.settings.answer_cache_ttl_seconds:
            self._answer_cache.pop(self._cache_key(message), None)
            return None
        return entry["payload"]

    def _cache_put(self, message: str, payload: dict[str, Any]) -> None:
        if not payload.get("answer"):
            return
        if len(self._answer_cache) >= 64:  # bounded — this is a tiny hot cache
            self._answer_cache.pop(next(iter(self._answer_cache)))
        self._answer_cache[self._cache_key(message)] = {"at": time.time(), "payload": payload}

    def _cached_payload(self, cached: dict[str, Any], session_id: str) -> dict[str, Any]:
        usage = dict(cached.get("usage") or {})
        usage["cost_usd"] = 0.0  # served from cache — this request cost nothing
        return {**cached, "session_id": session_id, "usage": usage, "cached": True, "duration_s": 0.0}

    # ---- entrypoints ----

    async def ask(self, message: str, session_id: str | None = None) -> dict[str, Any]:
        started = time.time()
        session_id, state, cacheable = self._prepare(message, session_id)

        cached = self._cache_get(message) if cacheable else None
        if cached:
            payload = self._cached_payload(cached, session_id)
            self.repository.append_chat_message(session_id, "user", message)
            self.repository.append_chat_message(session_id, "assistant", payload["answer"], payload["citations"])
            return payload

        final_state = await self.agent.graph.ainvoke(state)
        payload = self._finalize(session_id, message, final_state, started)
        if not payload["answer"]:
            raise RuntimeError("The agent did not produce an answer.")
        if cacheable:
            self._cache_put(message, payload)
        return payload

    async def stream(self, message: str, session_id: str | None = None):
        started = time.time()
        try:
            session_id, state, cacheable = self._prepare(message, session_id)

            cached = self._cache_get(message) if cacheable else None
            if cached:
                payload = self._cached_payload(cached, session_id)
                self.repository.append_chat_message(session_id, "user", message)
                self.repository.append_chat_message(session_id, "assistant", payload["answer"], payload["citations"])
                if payload.get("model"):
                    yield _sse("meta", {"model": payload["model"], "session_id": session_id})
                answer = payload["answer"]
                for start in range(0, len(answer), 64):
                    yield _sse("chunk", {"delta": answer[start : start + 64], "session_id": session_id})
                yield _sse("done", payload)
                return

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

            payload = self._finalize(session_id, message, final_state, started)
            if not payload["answer"]:
                yield _sse("error", {"detail": "The agent did not produce an answer."})
                return
            if cacheable:
                self._cache_put(message, payload)
            yield _sse("done", payload)
        except Exception as exc:  # surfaced to the client as an SSE error frame
            yield _sse("error", {"detail": str(exc)})
