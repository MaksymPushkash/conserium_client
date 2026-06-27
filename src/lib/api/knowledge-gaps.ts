"use client";

import type { KnowledgeGapListResponse, KnowledgeGapResponse, Note } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listKnowledgeGaps(
  params: { collection_id?: string | null; limit?: number } = {},
): Promise<KnowledgeGapListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/knowledge-gaps", { params: { query: params } }),
  );
}

export async function getKnowledgeGaps(
  topic: string,
  params: { collection_id?: string | null } = {},
): Promise<KnowledgeGapResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/knowledge-gaps/{topic}", {
      params: { path: { topic }, query: params },
    }),
  );
}

export async function createKnowledgeGapNote(
  gapId: string,
  payload: { topic: string; area_name: string; collection_id?: string | null },
): Promise<Note> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/knowledge-gaps/{gap_id}/note", {
      params: { path: { gap_id: gapId } },
      body: payload,
    }),
  );
}
