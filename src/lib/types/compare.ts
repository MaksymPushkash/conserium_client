import type { QuerySource } from "./query";

export interface CompareDocumentsRequest {
  left_document_id: string;
  right_document_id: string;
  prompt?: string | null;
  dimensions?: string[] | null;
  limit?: number;
}

export interface CompareDocumentsResponse {
  id: string;
  collection_id: string | null;
  left_document_id: string;
  right_document_id: string;
  left_title: string;
  right_title: string;
  dimensions: string[];
  markdown: string;
  summary: string;
  evidence_rows: CompareEvidenceRow[];
  sources: QuerySource[];
  created_at: string | null;
}

export interface CompareEvidenceRow {
  dimension: string;
  left_evidence: string | null;
  right_evidence: string | null;
  assessment: string;
  left_source_id: string | null;
  right_source_id: string | null;
  left_citation: string | null;
  right_citation: string | null;
  confidence?: number | null;
  rationale?: string | null;
}

export interface CompareListResponse {
  items: CompareDocumentsResponse[];
  total: number;
}
