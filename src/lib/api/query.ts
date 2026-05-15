"use client";

import type { QueryRequest, QueryResponse, QueryStreamDone, QueryStreamEvent } from "@/lib/types";
import { ApiError, authenticatedFetch, errorMessage, readPayload, request } from "./transport";

export function queryDocuments(payload: QueryRequest): Promise<QueryResponse> {
  return request<QueryResponse>("/query", { method: "POST", body: JSON.stringify(payload) });
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
          final = event.data as unknown as QueryStreamDone;
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
