import type { DocumentStatus, DocumentType } from "./documents";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CollectionListResponse {
  items: Collection[];
  total: number;
  limit: number;
  offset: number;
}

export interface CollectionWorkspaceStats {
  total_documents: number;
  ready_documents: number;
  processing_documents: number;
  failed_documents: number;
  topic_count: number;
  recent_question_count: number;
}

export interface CollectionWorkspaceDocument {
  id: string;
  title: string;
  type: DocumentType | string;
  status: DocumentStatus | string;
  summary: string | null;
  tags: string[];
  activity_temperature: string;
  created_at: string;
  updated_at: string | null;
}

export interface CollectionWorkspaceTopic {
  name: string;
  document_count: number;
  last_document_at: string | null;
}

export interface CollectionWorkspaceGap {
  title: string;
  reason: string;
  severity: "high" | "medium" | "low" | string;
  id: string | null;
  topic: string | null;
  coverage_ratio: number | null;
  missing_source_types: string[];
  suggested_actions: string[];
}

export interface CollectionWorkspaceQuestion {
  query_text: string;
  answer_preview: string | null;
  result_count: number;
  created_at: string;
}

export interface CollectionWorkspaceDraft {
  id: string;
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

export interface CollectionWorkspaceComparison {
  id: string;
  left_title: string;
  right_title: string;
  summary: string;
  dimensions: string[];
  created_at: string | null;
}

export interface CollectionWorkspace {
  collection: Collection;
  stats: CollectionWorkspaceStats;
  documents: CollectionWorkspaceDocument[];
  topics: CollectionWorkspaceTopic[];
  gaps: CollectionWorkspaceGap[];
  recent_questions: CollectionWorkspaceQuestion[];
  recent_drafts: CollectionWorkspaceDraft[];
  recent_comparisons: CollectionWorkspaceComparison[];
}

export interface CollectionShare {
  id: string;
  collection_id: string;
  slug: string;
  include_summaries: boolean;
  include_notes: boolean;
  revoked_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PublicCollectionDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  source_url: string | null;
  summary: string | null;
  word_count: number | null;
  language: string | null;
  tags: string[];
  created_at: string;
  updated_at: string | null;
}

export interface PublicCollectionResponse {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  documents: PublicCollectionDocument[];
  created_at: string;
  updated_at: string | null;
}
