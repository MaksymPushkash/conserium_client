"use client";

import type { QueryRequest, QueryResponse, QueryStreamDone, QueryStreamEvent } from "@/lib/types";
import { ApiError, authenticatedFetch, errorMessage, readPayload } from "./transport";
import { apiClient, unwrapApiResponse } from "./generated/client";

export async function queryDocuments(payload: QueryRequest): Promise<QueryResponse> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/query", { body: payload }));
}

export function parseQueryStreamEvent(raw: string): QueryStreamEvent | null {
  const dataLines = raw
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());
  if (dataLines.length === 0) {
    return null;
  }
  const payload = dataLines.join("\n");
  if (!payload || payload === "[DONE]") {
    return null;
  }
  return JSON.parse(payload) as QueryStreamEvent;
}

export async function streamQueryDocuments(
  payload: QueryRequest,
  onEvent: (event: QueryStreamEvent) => void,
  signal?: AbortSignal,
): Promise<QueryStreamDone | null> {
  const response = await authenticatedFetch("/query/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new ApiError(response.status, await readPayload(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let final: QueryStreamDone | null = null;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const event = parseQueryStreamEvent(part);
        if (!event) {
          continue;
        }
        onEvent(event);
        if (event.event === "done") {
          final = queryStreamDone(event.data);
        }
        if (event.event === "error") {
          const message = (event.data as { message?: unknown }).message;
          throw new Error(typeof message === "string" ? message : errorMessage(event.data));
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return final;
}

function queryStreamDone(data: Record<string, unknown>): QueryStreamDone {
  return {
    query_id: typeof data.query_id === "string" ? data.query_id : "",
    conversation_id: typeof data.conversation_id === "string" ? data.conversation_id : "",
    eval_scores: objectValue(data.eval_scores),
    trace_id: typeof data.trace_id === "string" ? data.trace_id : null,
    suggested_follow_up_questions: Array.isArray(data.suggested_follow_up_questions)
      ? data.suggested_follow_up_questions.filter((item): item is string => typeof item === "string")
      : undefined,
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
