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

import { apiClient, unwrapApiResponse } from "./generated/client";
import {
  normalizeDraft,
  normalizeDraftDetail,
  normalizeDraftVersions,
} from "./generated/normalizers";

export async function listDrafts(
  params: { collection_id?: string | null; limit?: number; offset?: number } = {},
): Promise<DraftListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/drafts", { params: { query: params } }));
}

export async function getDraft(id: string): Promise<DraftDetail> {
  return normalizeDraftDetail(unwrapApiResponse(
    await apiClient.GET("/api/v1/drafts/{draft_id}", { params: { path: { draft_id: id } } }),
  ));
}

export async function listDraftVersions(id: string): Promise<DraftVersionListResponse> {
  return normalizeDraftVersions(unwrapApiResponse(
    await apiClient.GET("/api/v1/drafts/{draft_id}/versions", { params: { path: { draft_id: id } } }),
  ));
}

export async function restoreDraftVersion(draftId: string, versionId: string): Promise<DraftDetail> {
  return normalizeDraftDetail(unwrapApiResponse(
    await apiClient.POST("/api/v1/drafts/{draft_id}/versions/{version_id}/restore", {
      params: { path: { draft_id: draftId, version_id: versionId } },
    }),
  ));
}

export async function deleteDraft(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/drafts/{draft_id}", { params: { path: { draft_id: id } } }),
  );
}

export async function listDraftTemplates(): Promise<DraftTemplateListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/drafts/templates"));
}

export async function generateDraftOutline(payload: DraftGenerateRequest): Promise<DraftOutlineResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/drafts/outline", { body: draftGenerateBody(payload) }),
  );
}

export async function generateDraft(payload: DraftGenerateRequest): Promise<DraftResponse> {
  return normalizeDraft(unwrapApiResponse(
    await apiClient.POST("/api/v1/drafts/generate", { body: draftGenerateBody(payload) }),
  ));
}

function draftGenerateBody(payload: DraftGenerateRequest) {
  return {
    ...payload,
    limit: payload.limit ?? 8,
    scope_type: payload.scope_type ?? "all",
    template_id: payload.template_id ?? "brief",
  };
}
