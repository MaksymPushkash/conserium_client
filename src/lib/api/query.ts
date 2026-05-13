"use client";

import { API_V1_URL } from "@/lib/config";
import type { QueryRequest, QueryResponse, QueryStreamEvent } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError, errorMessage, readPayload, request } from "./transport";

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
): Promise<QueryResponse | null> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers({ "Content-Type": "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_V1_URL}/query/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
    credentials: "include",
  });

  if (!response.ok || !response.body) {
    throw new ApiError(response.status, await readPayload(response));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let final: QueryResponse | null = null;

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
          final = event.data as unknown as QueryResponse;
        }
        if (event.event === "error") {
          throw new Error(errorMessage((event.data as { error?: unknown }).error));
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return final;
}
