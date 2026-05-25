export interface KnowledgeGapArea {
  id: string;
  name: string;
  covered: boolean;
  evidence_count: number;
  evidence_titles: string[];
  why_detected: string;
  missing_source_types: string[];
  severity: string;
  rationale: string;
  suggested_actions: string[];
}

export interface KnowledgeGapResponse {
  id: string;
  topic: string;
  collection_id: string | null;
  covered_count: number;
  missing_count: number;
  coverage_ratio: number;
  why_detected: string;
  missing_source_types: string[];
  severity: string;
  rationale: string;
  suggested_actions: string[];
  areas: KnowledgeGapArea[];
}

export interface KnowledgeGapListResponse {
  items: KnowledgeGapResponse[];
  total: number;
}
