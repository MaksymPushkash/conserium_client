"use client";

import type { DocumentChunkResponse, DocumentListResponse, DocumentResponse, DocumentStatus, DocumentStatusResponse, DocumentType } from "@/lib/types";
import { request } from "./transport";

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

export function getDocument(id: string): Promise<DocumentResponse> {
  return request<DocumentResponse>(`/documents/${id}`);
}

export function getDocumentChunk(documentId: string, chunkId: string): Promise<DocumentChunkResponse> {
  return request<DocumentChunkResponse>(`/documents/${documentId}/chunks/${chunkId}`);
}

export function getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
  return request<DocumentStatusResponse>(`/documents/${documentId}/status`);
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
