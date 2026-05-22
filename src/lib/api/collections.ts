"use client";

import type { Collection, CollectionListResponse, CollectionShare, CollectionWorkspace, PublicCollectionResponse } from "@/lib/types";
import { request } from "./transport";

export function listCollections(params: { limit?: number; offset?: number } = {}): Promise<CollectionListResponse> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return request<CollectionListResponse>(`/collections${query ? `?${query}` : ""}`);
}

export function getCollectionWorkspace(id: string): Promise<CollectionWorkspace> {
  return request<CollectionWorkspace>(`/collections/${id}/workspace`);
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

export function getCollectionShare(id: string): Promise<CollectionShare | null> {
  return request<CollectionShare | null>(`/collections/${id}/share`);
}

export function createCollectionShare(id: string): Promise<CollectionShare> {
  return request<CollectionShare>(`/collections/${id}/share`, { method: "POST" });
}

export function revokeCollectionShare(id: string): Promise<void> {
  return request<void>(`/collections/${id}/share`, { method: "DELETE" });
}

export function getPublicCollection(slug: string): Promise<PublicCollectionResponse> {
  return request<PublicCollectionResponse>(`/public/collections/${slug}`);
}
