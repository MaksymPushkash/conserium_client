"use client";

import type { CompareDocumentsRequest, CompareDocumentsResponse, CompareListResponse } from "@/lib/types";
import { request } from "./transport";

export function compareDocuments(payload: CompareDocumentsRequest): Promise<CompareDocumentsResponse> {
  return request<CompareDocumentsResponse>("/compare/documents", { method: "POST", body: JSON.stringify(payload) });
}

export function listCompareResults(params: { collection_id?: string | null; limit?: number; offset?: number } = {}): Promise<CompareListResponse> {
  const search = new URLSearchParams();
  if (params.collection_id) search.set("collection_id", params.collection_id);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return request<CompareListResponse>(`/compare/results${query ? `?${query}` : ""}`);
}

export function getCompareResult(id: string): Promise<CompareDocumentsResponse> {
  return request<CompareDocumentsResponse>(`/compare/results/${id}`);
}

export function deleteCompareResult(id: string): Promise<void> {
  return request<void>(`/compare/results/${id}`, { method: "DELETE" });
}
