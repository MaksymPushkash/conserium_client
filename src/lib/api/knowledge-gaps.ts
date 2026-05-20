"use client";

import type { KnowledgeGapResponse } from "@/lib/types";
import { request } from "./transport";

export function getKnowledgeGaps(topic: string): Promise<KnowledgeGapResponse> {
  const search = new URLSearchParams({ topic });
  return request<KnowledgeGapResponse>(`/knowledge-gaps?${search.toString()}`);
}
