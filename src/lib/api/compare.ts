"use client";

import type { CompareDocumentsRequest, CompareDocumentsResponse, CompareListResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";
import { normalizeCompare, normalizeCompareList } from "./generated/normalizers";

export async function compareDocuments(payload: CompareDocumentsRequest): Promise<CompareDocumentsResponse> {
  return normalizeCompare(unwrapApiResponse(
    await apiClient.POST("/api/v1/compare/documents", { body: { ...payload, limit: payload.limit ?? 8 } }),
  ));
}

export async function listCompareResults(
  params: { collection_id?: string | null; limit?: number; offset?: number } = {},
): Promise<CompareListResponse> {
  return normalizeCompareList(unwrapApiResponse(
    await apiClient.GET("/api/v1/compare/results", { params: { query: params } }),
  ));
}

export async function getCompareResult(id: string): Promise<CompareDocumentsResponse> {
  return normalizeCompare(unwrapApiResponse(
    await apiClient.GET("/api/v1/compare/results/{comparison_id}", { params: { path: { comparison_id: id } } }),
  ));
}

export async function deleteCompareResult(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/compare/results/{comparison_id}", { params: { path: { comparison_id: id } } }),
  );
}
