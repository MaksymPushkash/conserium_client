"use client";

import type { Topic, TopicDetailResponse, TopicListResponse } from "@/lib/types";
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

export function renameTopic(name: string, body: { display_name: string }): Promise<Topic> {
  return request<Topic>(`/topics/${encodeURIComponent(name)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function mergeTopic(name: string, body: { source_names: string[] }): Promise<Topic> {
  return request<Topic>(`/topics/${encodeURIComponent(name)}/merge`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function pinTopic(name: string, pinned = true): Promise<Topic> {
  return request<Topic>(`/topics/${encodeURIComponent(name)}/pin`, {
    method: "POST",
    body: JSON.stringify({ pinned }),
  });
}

export function ignoreTopic(name: string, ignored = true): Promise<Topic> {
  return request<Topic>(`/topics/${encodeURIComponent(name)}/ignore`, {
    method: "POST",
    body: JSON.stringify({ ignored }),
  });
}
