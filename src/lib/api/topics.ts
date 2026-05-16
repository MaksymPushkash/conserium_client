"use client";

import type { TopicDetailResponse, TopicListResponse } from "@/lib/types";
import { request } from "./transport";

export function listTopics(params: { limit?: number; offset?: number } = {}): Promise<TopicListResponse> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return request<TopicListResponse>(`/topics${query ? `?${query}` : ""}`);
}

export function getTopic(name: string, params: { document_limit?: number } = {}): Promise<TopicDetailResponse> {
  const search = new URLSearchParams();
  if (params.document_limit !== undefined) search.set("document_limit", String(params.document_limit));
  const query = search.toString();
  return request<TopicDetailResponse>(`/topics/${encodeURIComponent(name)}${query ? `?${query}` : ""}`);
}
