"use client";

import type { KnowledgeGraphConcern, KnowledgeGraphResponse } from "@/lib/types";
import { request } from "./transport";

export interface KnowledgeGraphParams {
  document_limit?: number;
  topic_limit?: number;
  collection_id?: string | null;
  tag?: string | null;
  topic?: string | null;
  document_type?: string | null;
  recency_days?: number | null;
}

export function getKnowledgeGraph(params: KnowledgeGraphParams = {}): Promise<KnowledgeGraphResponse> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return request<KnowledgeGraphResponse>(`/knowledge-graph${query ? `?${query}` : ""}`);
}

export function createKnowledgeGraphConcern(payload: {
  message: string;
  node_id?: string | null;
  node_kind?: string | null;
  node_label?: string | null;
}): Promise<KnowledgeGraphConcern> {
  return request<KnowledgeGraphConcern>("/knowledge-graph/concerns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
