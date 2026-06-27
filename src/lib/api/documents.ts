"use client";

import type {
  DocumentChunkResponse,
  DocumentConnectionsResponse,
  DocumentListResponse,
  DocumentQuestionHistoryResponse,
  DocumentResponse,
  DocumentSearchResponse,
  DocumentStatus,
  DocumentStatusResponse,
  DocumentType,
} from "@/lib/types";
import { filenameFromContentDisposition } from "./exports";
import { apiClient, unwrapApiResponse } from "./generated/client";
import { authenticatedFetch, readPayload, ApiError } from "./transport";

export interface DocumentListParams {
  limit?: number;
  offset?: number;
  type?: DocumentType | null;
  status?: DocumentStatus | null;
  collection_id?: string | null;
  tag?: string | null;
}

export async function listDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents", { params: { query: params } }),
  );
}

export interface DocumentSearchParams {
  query: string;
  limit?: number;
  type?: DocumentType | null;
  status?: DocumentStatus | null;
  collection_id?: string | null;
  tag?: string | null;
}

export async function searchDocuments(params: DocumentSearchParams): Promise<DocumentSearchResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/search", { params: { query: params } }),
  );
}

export async function getDocument(id: string): Promise<DocumentResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/{document_id}", { params: { path: { document_id: id } } }),
  );
}

export async function getDocumentChunk(documentId: string, chunkId: string): Promise<DocumentChunkResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/{document_id}/chunks/{chunk_id}", {
      params: { path: { document_id: documentId, chunk_id: chunkId } },
    }),
  );
}

export async function getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/{document_id}/status", { params: { path: { document_id: documentId } } }),
  );
}

export async function getDocumentQuestionHistory(documentId: string, limit = 5): Promise<DocumentQuestionHistoryResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/{document_id}/questions", {
      params: { path: { document_id: documentId }, query: { limit } },
    }),
  );
}

export async function getDocumentConnections(documentId: string, limit = 5): Promise<DocumentConnectionsResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/{document_id}/connections", {
      params: { path: { document_id: documentId }, query: { limit } },
    }),
  );
}

export async function renameDocument(id: string, payload: { title: string }): Promise<DocumentResponse> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/documents/{document_id}", {
      params: { path: { document_id: id } },
      body: payload,
    }),
  );
}

export async function moveDocument(id: string, payload: { collection_id: string | null }): Promise<DocumentResponse> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/documents/{document_id}/collection", {
      params: { path: { document_id: id } },
      body: payload,
    }),
  );
}

export async function retryDocument(id: string): Promise<DocumentResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/documents/{document_id}/retry", { params: { path: { document_id: id } } }),
  );
}

export async function reprocessDocument(id: string): Promise<DocumentResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/documents/{document_id}/reprocess", { params: { path: { document_id: id } } }),
  );
}

export async function deleteDocument(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/documents/{document_id}", { params: { path: { document_id: id } } }),
  );
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

export async function bulkDeleteDocuments(documentIds: string[]): Promise<void> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/documents/bulk/delete", { body: { document_ids: documentIds } }),
  );
}

export async function bulkMoveDocuments(documentIds: string[], collectionId: string | null): Promise<void> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/documents/bulk/move", {
      body: { document_ids: documentIds, collection_id: collectionId },
    }),
  );
}

export async function bulkAddDocumentTags(documentIds: string[], tags: string[]): Promise<void> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/documents/bulk/tags", { body: { document_ids: documentIds, tags } }),
  );
}

export async function bulkReprocessDocuments(documentIds: string[]): Promise<void> {
  unwrapApiResponse(
    await apiClient.POST("/api/v1/documents/bulk/reprocess", { body: { document_ids: documentIds } }),
  );
}

export async function getDocumentSuggestedQuestions(id: string): Promise<string[]> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/documents/{document_id}/suggested-questions", {
      params: { path: { document_id: id } },
    }),
  );
}
