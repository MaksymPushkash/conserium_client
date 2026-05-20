"use client";

import type { KnowledgeGraphConcern, KnowledgeGraphResponse } from "@/lib/types";
import { request } from "./transport";

export function getKnowledgeGraph(params: { document_limit?: number; topic_limit?: number } = {}): Promise<KnowledgeGraphResponse> {
  const search = new URLSearchParams();
  if (params.document_limit !== undefined) search.set("document_limit", String(params.document_limit));
  if (params.topic_limit !== undefined) search.set("topic_limit", String(params.topic_limit));
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
