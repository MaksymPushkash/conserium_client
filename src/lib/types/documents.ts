export type DocumentType = "PDF" | "URL" | "YOUTUBE" | "IMAGE" | "TEXT" | "MARKDOWN";
export type DocumentStatus = "PENDING" | "QUEUED" | "PROCESSING" | "READY" | "FAILED";
export type DocumentActivityTemperature = "hot" | "cold" | "forgotten" | string;

export type MetadataItem = Record<string, unknown>;

export interface DocumentResponse {
  id: string;
  user_id: string;
  collection_id: string | null;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  source_url: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  raw_content: string | null;
  summary: string | null;
  word_count: number | null;
  language: string | null;
  entities: MetadataItem[] | null;
  categories: MetadataItem[] | null;
  visual_metadata: MetadataItem | null;
  suggested_questions: string[];
  tags: string[];
  last_used_at: string | null;
  query_count: number;
  citation_count: number;
  activity_temperature: DocumentActivityTemperature;
  is_duplicate: boolean;
  duplicate_of_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export type DocumentListItem = Omit<DocumentResponse, "raw_content" | "entities" | "categories" | "visual_metadata">;

export interface DocumentListResponse {
  items: DocumentListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface DocumentSearchResult {
  document: DocumentListItem;
  snippet: string;
  score: number | null;
  chunk_id: string;
  page_number: number | null;
}

export interface DocumentSearchResponse {
  items: DocumentSearchResult[];
  query: string;
  total: number;
  limit: number;
}

export interface DocumentProcessingStep {
  key: string;
  label: string;
  state: "complete" | "current" | "pending" | "failed" | string;
  progress: number;
  message: string | null;
}

export interface DocumentStatusResponse {
  document_id: string;
  status: DocumentStatus | string;
  progress: number;
  message: string;
  failure_reason: string | null;
  timeline: DocumentProcessingStep[];
}

export interface DocumentChunkResponse {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  start_char: number | null;
  end_char: number | null;
  page_number: number | null;
  token_count: number | null;
}

export interface DocumentQuestionHistoryItem {
  query_text: string;
  answer_text: string | null;
  result_count: number;
  created_at: string;
}

export interface DocumentQuestionHistoryResponse {
  items: DocumentQuestionHistoryItem[];
  document_id: string;
  limit: number;
}

export interface IngestDocumentPayload {
  title: string;
  type: DocumentType;
  collection_id?: string | null;
  source_url?: string | null;
  raw_content?: string | null;
  language?: string | null;
}
