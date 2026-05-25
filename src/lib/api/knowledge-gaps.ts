"use client";

import type { KnowledgeGapListResponse, KnowledgeGapResponse, Note } from "@/lib/types";
import { request } from "./transport";

export function listKnowledgeGaps(params: { collection_id?: string | null; limit?: number } = {}): Promise<KnowledgeGapListResponse> {
  const search = new URLSearchParams();
  if (params.collection_id) search.set("collection_id", params.collection_id);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  const query = search.toString();
  return request<KnowledgeGapListResponse>(`/knowledge-gaps${query ? `?${query}` : ""}`);
}

export function getKnowledgeGaps(topic: string, params: { collection_id?: string | null } = {}): Promise<KnowledgeGapResponse> {
  const search = new URLSearchParams();
  if (params.collection_id) search.set("collection_id", params.collection_id);
  const query = search.toString();
  return request<KnowledgeGapResponse>(`/knowledge-gaps/${encodeURIComponent(topic)}${query ? `?${query}` : ""}`);
}

export function createKnowledgeGapNote(
  gapId: string,
  payload: { topic: string; area_name: string; collection_id?: string | null },
): Promise<Note> {
  return request<Note>(`/knowledge-gaps/${encodeURIComponent(gapId)}/note`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
