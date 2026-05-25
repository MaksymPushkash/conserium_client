"use client";

import type {
  DraftDetail,
  DraftGenerateRequest,
  DraftListResponse,
  DraftOutlineResponse,
  DraftResponse,
  DraftTemplateListResponse,
  DraftVersionListResponse,
} from "@/lib/types";
import { request } from "./transport";

export function listDrafts(params: { collection_id?: string | null; limit?: number; offset?: number } = {}): Promise<DraftListResponse> {
  const search = new URLSearchParams();
  if (params.collection_id) search.set("collection_id", params.collection_id);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return request<DraftListResponse>(`/drafts${query ? `?${query}` : ""}`);
}

export function getDraft(id: string): Promise<DraftDetail> {
  return request<DraftDetail>(`/drafts/${id}`);
}

export function listDraftVersions(id: string): Promise<DraftVersionListResponse> {
  return request<DraftVersionListResponse>(`/drafts/${id}/versions`);
}

export function restoreDraftVersion(draftId: string, versionId: string): Promise<DraftDetail> {
  return request<DraftDetail>(`/drafts/${draftId}/versions/${versionId}/restore`, { method: "POST" });
}

export function deleteDraft(id: string): Promise<void> {
  return request<void>(`/drafts/${id}`, { method: "DELETE" });
}

export function listDraftTemplates(): Promise<DraftTemplateListResponse> {
  return request<DraftTemplateListResponse>("/drafts/templates");
}

export function generateDraftOutline(payload: DraftGenerateRequest): Promise<DraftOutlineResponse> {
  return request<DraftOutlineResponse>("/drafts/outline", { method: "POST", body: JSON.stringify(payload) });
}

export function generateDraft(payload: DraftGenerateRequest): Promise<DraftResponse> {
  return request<DraftResponse>("/drafts/generate", { method: "POST", body: JSON.stringify(payload) });
}
