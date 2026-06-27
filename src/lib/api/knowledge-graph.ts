"use client";

import type { DocumentType, KnowledgeGraphConcern, KnowledgeGraphInsightsResponse, KnowledgeGraphResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export interface KnowledgeGraphParams {
  document_limit?: number;
  topic_limit?: number;
  collection_id?: string | null;
  tag?: string | null;
  topic?: string | null;
  document_type?: string | null;
  recency_days?: number | null;
}

export async function getKnowledgeGraph(params: KnowledgeGraphParams = {}): Promise<KnowledgeGraphResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/knowledge-graph", { params: { query: knowledgeGraphQuery(params) } }),
  );
}

export async function getKnowledgeGraphInsights(
  params: KnowledgeGraphParams = {},
): Promise<KnowledgeGraphInsightsResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/knowledge-graph/insights", { params: { query: knowledgeGraphQuery(params) } }),
  );
}

function knowledgeGraphQuery(params: KnowledgeGraphParams) {
  return {
    ...params,
    document_type: isDocumentType(params.document_type) ? params.document_type : null,
  };
}

function isDocumentType(value: string | null | undefined): value is DocumentType {
  return value === "PDF" || value === "URL" || value === "YOUTUBE" || value === "IMAGE" || value === "TEXT" || value === "MARKDOWN";
}

export async function createKnowledgeGraphConcern(payload: {
  message: string;
  node_id?: string | null;
  node_kind?: string | null;
  node_label?: string | null;
}): Promise<KnowledgeGraphConcern> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/knowledge-graph/concerns", {
      body: payload,
    }),
  );
}
