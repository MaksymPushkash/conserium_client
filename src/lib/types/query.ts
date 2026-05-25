import type { DocumentType } from "./documents";

export interface QueryRequest {
  query: string;
  conversation_id?: string | null;
  collection_id?: string | null;
  document_id?: string | null;
  tag_names?: string[] | null;
  document_types?: DocumentType[] | null;
  limit: number;
}

export interface QuerySource {
  chunk_id: string;
  document_id: string;
  document_title: string | null;
  content: string;
  page_number: number | null;
  chunk_index: number;
  score: number | null;
  citation?: string;
  used_in_answer?: boolean;
}

export interface RefragChunk {
  chunk_id: string;
  document_id: string;
  document_title: string | null;
  representation: "FULL_TEXT" | "COMPRESSED" | "DISCARDED";
  page_number: number | null;
  chunk_index: number;
  score: number | null;
  context_text: string;
  original_token_count: number;
  context_token_count: number;
  citation: string | null;
}

export interface RefragContext {
  full_text_chunks: RefragChunk[];
  compressed_chunks: RefragChunk[];
  discarded_chunks: RefragChunk[];
  total_original_tokens: number;
  total_context_tokens: number;
  compression_strategy: string;
}

export interface QueryDebug {
  original_query: string;
  retrieval_query: string;
  selected_collection_id: string | null;
  selected_tags: string[];
  promoted_document_ids: string[];
  retrieved_sources: QuerySource[];
  final_sources: QuerySource[];
  used_sources: QuerySource[];
  filtered_sources: QuerySource[];
}

export interface QueryResponse {
  conversation_id: string;
  query: string;
  answer: string;
  sources: QuerySource[];
  refrag_context: RefragContext;
  debug: QueryDebug | null;
}

export interface QueryStreamDone {
  query_id: string;
  conversation_id: string;
  eval_scores: Record<string, unknown>;
  trace_id: string | null;
}

export type QueryStreamEventName = "metadata" | "token" | "sources" | "debug" | "refrag_context" | "done" | "error";

export interface QueryStreamEvent {
  event: QueryStreamEventName;
  data: Record<string, unknown>;
}
