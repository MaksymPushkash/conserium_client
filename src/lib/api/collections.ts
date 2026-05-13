"use client";

import type { Collection, CollectionListResponse } from "@/lib/types";
import { request } from "./transport";

export function listCollections(params: { limit?: number; offset?: number } = {}): Promise<CollectionListResponse> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return request<CollectionListResponse>(`/collections${query ? `?${query}` : ""}`);
}

export function createCollection(payload: { name: string; description?: string | null; color?: string | null }): Promise<Collection> {
  return request<Collection>("/collections", { method: "POST", body: JSON.stringify(payload) });
}

export function updateCollection(
  id: string,
  payload: { name?: string; description?: string | null; color?: string | null },
): Promise<Collection> {
  return request<Collection>(`/collections/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteCollection(id: string): Promise<void> {
  return request<void>(`/collections/${id}`, { method: "DELETE" });
}
