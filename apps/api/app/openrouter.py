"""Streaming client for any OpenAI-compatible chat endpoint (OpenRouter by default).

Handles the model-fallback chain: the primary model is tried first and, while
no tokens have been forwarded yet, any transport/HTTP/empty-stream failure
moves on to the next candidate. The model that actually answers is surfaced
in every event so the UI can display it.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

import httpx

from .config import Settings


class LlmError(RuntimeError):
    pass


class OpenRouterClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def _headers(self) -> dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.settings.openrouter_api_key}",
            "Content-Type": "application/json",
        }
        if self.settings.openrouter_site_url:
            headers["HTTP-Referer"] = self.settings.openrouter_site_url
        if self.settings.openrouter_site_name:
            headers["X-Title"] = self.settings.openrouter_site_name
        return headers

    def _require_key(self) -> None:
        if not self.settings.openrouter_api_key:
            raise LlmError("OPENROUTER_API_KEY is not configured on the API server.")

    async def stream_chat(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None = None,
        temperature: float = 0.2,
        max_tokens: int = 900,
    ) -> AsyncIterator[dict[str, Any]]:
        """Yields events:
        {"type": "model", "model": str}            — once, when a model accepts
        {"type": "content", "delta": str}          — streamed answer tokens
        {"type": "end", "content": str, "tool_calls": [...], "model": str}
        """
        self._require_key()

        errors: list[str] = []
        for model in self.settings.model_candidates:
            emitted = False
            try:
                async for event in self._stream_one_model(model, messages, tools, temperature, max_tokens):
                    if event["type"] in {"model", "content"}:
                        emitted = True
                    yield event
                return
            except (httpx.HTTPError, LlmError) as exc:
                if emitted:
                    # Tokens already reached the client; switching models now
                    # would splice two answers together — surface the failure.
                    raise LlmError(f"Model {model} failed mid-stream: {exc}") from exc
                errors.append(f"{model}: {exc}")

        raise LlmError("All configured models failed. " + " | ".join(errors))

    async def _stream_one_model(
        self,
        model: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]] | None,
        temperature: float,
        max_tokens: int,
    ) -> AsyncIterator[dict[str, Any]]:
        payload: dict[str, Any] = {
            "model": model,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
            "messages": messages,
        }
        if tools:
            payload["tools"] = tools

        content_parts: list[str] = []
        tool_calls: dict[int, dict[str, Any]] = {}
        seen_model: str | None = None
        got_payload = False

        async with httpx.AsyncClient(timeout=self.settings.llm_timeout_seconds) as client:
            async with client.stream(
                "POST", self.settings.openrouter_chat_url, headers=self._headers(), json=payload
            ) as response:
                if response.status_code >= 400:
                    body = await response.aread()
                    raise LlmError(f"HTTP {response.status_code}: {self._error_detail(body)}")

                async for line in response.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = line[len("data:") :].strip()
                    if not data or data == "[DONE]":
                        continue
                    try:
                        chunk = json.loads(data)
                    except ValueError:
                        continue

                    if isinstance(chunk.get("error"), dict):
                        raise LlmError(str(chunk["error"].get("message", "provider error")))

                    got_payload = True
                    if seen_model is None and isinstance(chunk.get("model"), str):
                        seen_model = chunk["model"]
                        yield {"type": "model", "model": seen_model}

                    for choice in chunk.get("choices", []):
                        delta = choice.get("delta") or {}
                        piece = delta.get("content")
                        if isinstance(piece, str) and piece:
                            content_parts.append(piece)
                            yield {"type": "content", "delta": piece}
                        for call in delta.get("tool_calls") or []:
                            index = int(call.get("index", 0))
                            slot = tool_calls.setdefault(
                                index,
                                {"id": "", "type": "function", "function": {"name": "", "arguments": ""}},
                            )
                            if call.get("id"):
                                slot["id"] = call["id"]
                            function = call.get("function") or {}
                            if function.get("name"):
                                slot["function"]["name"] = function["name"]
                            if function.get("arguments"):
                                slot["function"]["arguments"] += function["arguments"]

        if not got_payload:
            raise LlmError("The provider returned an empty stream.")

        yield {
            "type": "end",
            "content": "".join(content_parts),
            "tool_calls": [tool_calls[index] for index in sorted(tool_calls)],
            "model": seen_model or model,
        }

    async def complete(
        self,
        messages: list[dict[str, Any]],
        temperature: float = 0.0,
        max_tokens: int = 200,
    ) -> tuple[str, str]:
        """Non-streaming helper (used by the guardrail). Returns (text, model)."""
        self._require_key()

        errors: list[str] = []
        async with httpx.AsyncClient(timeout=self.settings.llm_timeout_seconds) as client:
            for model in self.settings.model_candidates:
                payload = {
                    "model": model,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "messages": messages,
                }
                try:
                    response = await client.post(
                        self.settings.openrouter_chat_url, headers=self._headers(), json=payload
                    )
                except httpx.HTTPError as exc:
                    errors.append(f"{model}: {exc}")
                    continue

                if response.status_code >= 400:
                    errors.append(f"{model}: HTTP {response.status_code}: {self._error_detail(response.content)}")
                    continue

                data = response.json()
                text = (data.get("choices", [{}])[0].get("message", {}).get("content") or "").strip()
                if text:
                    return text, str(data.get("model", model))
                errors.append(f"{model}: empty completion")

        raise LlmError("All configured models failed. " + " | ".join(errors))

    @staticmethod
    def _error_detail(body: bytes | str) -> str:
        text = body.decode("utf-8", errors="replace") if isinstance(body, bytes) else body
        try:
            payload = json.loads(text)
        except ValueError:
            return text[:300].strip() or "unknown error"
        if isinstance(payload, dict):
            error = payload.get("error")
            if isinstance(error, dict) and isinstance(error.get("message"), str):
                return error["message"].strip()
            if isinstance(payload.get("detail"), str):
                return payload["detail"].strip()
        return str(payload)[:300]
