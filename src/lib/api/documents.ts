"use client";

import type {
  DocumentChunkResponse,
  DocumentListResponse,
  DocumentQuestionHistoryResponse,
  DocumentResponse,
  DocumentSearchResponse,
  DocumentStatus,
  DocumentStatusResponse,
  DocumentType,
} from "@/lib/types";
import { filenameFromContentDisposition } from "./exports";
import { authenticatedFetch, readPayload, request, ApiError } from "./transport";

export interface DocumentListParams {
  limit?: number;
  offset?: number;
  type?: DocumentType | null;
  status?: DocumentStatus | null;
  collection_id?: string | null;
  tag?: string | null;
}

export function listDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return request<DocumentListResponse>(`/documents${query ? `?${query}` : ""}`);
}

export interface DocumentSearchParams {
  query: string;
  limit?: number;
  type?: DocumentType | null;
  status?: DocumentStatus | null;
  collection_id?: string | null;
  tag?: string | null;
}

export function searchDocuments(params: DocumentSearchParams): Promise<DocumentSearchResponse> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  return request<DocumentSearchResponse>(`/documents/search?${search.toString()}`);
}

export function getDocument(id: string): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}`);
}

export function getDocumentChunk(documentId: string, chunkId: string): Promise<DocumentChunkResponse> {
  return request<DocumentChunkResponse>(`/documents/${documentId}/chunks/${chunkId}`);
}

export function getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
  return request<DocumentStatusResponse>(`/documents/${documentId}/status`);
}

export function getDocumentQuestionHistory(documentId: string, limit = 5): Promise<DocumentQuestionHistoryResponse> {
  return request<DocumentQuestionHistoryResponse>(`/documents/${documentId}/questions?limit=${limit}`);
}

export function renameDocument(id: string, payload: { title: string }): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function moveDocument(id: string, payload: { collection_id: string | null }): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}/collection`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function updateDocument(
  id: string,
  payload: { title?: string; collection_id?: string | null; tag_names?: string[] },
): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function retryDocument(id: string): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}/retry`, { method: "POST" });
}

export function reprocessDocument(id: string): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}/reprocess`, { method: "POST" });
}

export function deleteDocument(id: string): Promise<void> {
  return request<void>(`/documents/${id}`, { method: "DELETE" });
}

export async function exportDocument(id: string, format: "markdown" | "pdf"): Promise<{ blob: Blob; filename: string }> {
  const response = await authenticatedFetch(`/documents/${id}/export?format=${format}`);
  if (!response.ok) {
    throw new ApiError(response.status, await readPayload(response));
  }
  return {
    blob: await response.blob(),
    filename: filenameFromContentDisposition(response.headers.get("Content-Disposition")) ?? `document.${format === "pdf" ? "pdf" : "md"}`,
  };
}

export function bulkDeleteDocuments(documentIds: string[]): Promise<{ deleted: number }> {
  return request<{ deleted: number }>("/documents/bulk/delete", {
    method: "POST",
    body: JSON.stringify({ document_ids: documentIds }),
  });
}

export function bulkReprocessDocuments(documentIds: string[]): Promise<{ queued: number }> {
  return request<{ queued: number }>("/documents/bulk/reprocess", {
    method: "POST",
    body: JSON.stringify({ document_ids: documentIds }),
  });
}

export function getDocumentSuggestedQuestions(id: string): Promise<string[]> {
  return request<string[]>(`/documents/${id}/suggested-questions`);
}
