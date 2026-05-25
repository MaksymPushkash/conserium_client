import type { DocumentType } from "./documents";
import type { QuerySource } from "./query";

export interface DraftGenerateRequest {
  prompt: string;
  draft_id?: string | null;
  template_id?: string;
  scope_type?: "all" | "documents" | "collection" | "topic" | "knowledge_gap" | string;
  collection_id?: string | null;
  document_ids?: string[] | null;
  topic?: string | null;
  knowledge_gap_id?: string | null;
  outline?: string[] | null;
  tag_names?: string[] | null;
  document_types?: DocumentType[] | null;
  limit?: number;
}

export interface DraftTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  outline: string[];
}

export interface DraftTemplateListResponse {
  items: DraftTemplate[];
}

export interface DraftOutlineResponse {
  prompt: string;
  template_id: string;
  scope_type: string;
  title: string;
  sections: string[];
}

export interface DraftResponse {
  draft_id: string;
  version_id: string;
  version_number: number;
  prompt: string;
  template_id: string;
  scope_type: string;
  markdown: string;
  sources: QuerySource[];
  gaps: string[];
}

export interface DraftHistoryItem extends DraftResponse {
  id: string;
  title: string;
  collection_id: string | null;
  topic: string | null;
  knowledge_gap_id: string | null;
  created_at: string;
}

export interface DraftListItem {
  id: string;
  collection_id: string | null;
  title: string;
  prompt: string;
  template_id: string;
  scope_type: string;
  topic: string | null;
  knowledge_gap_id: string | null;
  version_number: number;
  created_at: string;
  updated_at: string | null;
}

export interface DraftListResponse {
  items: DraftListItem[];
  total: number;
}

export interface DraftDetail {
  id: string;
  collection_id: string | null;
  current_version_id: string;
  title: string;
  prompt: string;
  template_id: string;
  scope_type: string;
  topic: string | null;
  knowledge_gap_id: string | null;
  scope_metadata: Record<string, unknown>;
  markdown: string;
  sources: QuerySource[];
  gaps: string[];
  version_number: number;
  created_at: string;
  updated_at: string | null;
}

export interface DraftVersion {
  id: string;
  draft_id: string;
  version_number: number;
  title: string;
  prompt: string;
  template_id: string;
  scope_type: string;
  collection_id: string | null;
  topic: string | null;
  knowledge_gap_id: string | null;
  markdown: string;
  sources: QuerySource[];
  gaps: string[];
  created_at: string;
}

export interface DraftVersionListResponse {
  items: DraftVersion[];
}
