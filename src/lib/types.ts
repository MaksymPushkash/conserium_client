export type DocumentType = "PDF" | "URL" | "YOUTUBE" | "IMAGE" | "TEXT" | "MARKDOWN";
export type DocumentStatus = "PENDING" | "QUEUED" | "PROCESSING" | "READY" | "FAILED";
export type DocumentActivityTemperature = "hot" | "cold" | "forgotten" | string;

export type MetadataItem = Record<string, unknown>;

export interface TokenResponse {
  access_token: string;
}

export interface AppearancePreferences {
  theme: "dark";
}

export interface PrivacyPreferences {
  share_usage_data: boolean;
  retain_query_history: boolean;
}

export interface AIPreferences {
  answer_language: "match_question" | "english" | "ukrainian";
  retrieval_depth: "focused" | "balanced" | "broad";
}

export interface UserPreferences {
  appearance: AppearancePreferences;
  privacy: PrivacyPreferences;
  ai: AIPreferences;
}

export interface UserResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string | null;
}

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

export interface StatsOverviewResponse {
  total_documents: number;
  ready_documents: number;
  processing_documents: number;
  failed_documents: number;
  hot_documents: number;
  cold_documents: number;
  forgotten_documents: number;
  active_documents: number;
  query_count: number;
  citation_count: number;
}

export interface StatsTimelineBucket {
  month: string;
  saved_documents: number;
  active_documents: number;
  query_count: number;
  citation_count: number;
}

export interface StatsTimelineResponse {
  items: StatsTimelineBucket[];
  months: number;
}

export interface Topic {
  name: string;
  document_count: number;
  last_document_at: string | null;
}

export interface TopicListResponse {
  items: Topic[];
  total: number;
  limit: number;
  offset: number;
}

export interface TopicDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  summary: string | null;
  created_at: string;
}

export interface TopicDetailResponse {
  topic: Topic;
  documents: TopicDocument[];
}

export interface DraftGenerateRequest {
  prompt: string;
  collection_id?: string | null;
  tag_names?: string[] | null;
  document_types?: DocumentType[] | null;
  limit?: number;
}

export interface DraftResponse {
  prompt: string;
  markdown: string;
  sources: QuerySource[];
  gaps: string[];
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

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface ChatListResponse {
  items: ChatSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatMessageResponse {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system" | string;
  content: string;
  sources: QuerySource[] | null;
  refrag_context: RefragContext | null;
  eval_scores: Record<string, unknown> | null;
  trace_id: string | null;
  created_at: string;
}

export interface ChatDetailResponse {
  session: ChatSession;
  messages: ChatMessageResponse[];
}

export interface Note {
  id: string;
  collection_id: string | null;
  title: string;
  content: string;
  status: DocumentStatus;
  word_count: number;
  language: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
}

export type NoteListItem = Omit<Note, "content">;

export interface NoteListResponse {
  items: NoteListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface IngestDocumentPayload {
  title: string;
  type: DocumentType;
  collection_id?: string | null;
  source_url?: string | null;
  raw_content?: string | null;
  language?: string | null;
}

export interface QueryRequest {
  query: string;
  conversation_id?: string | null;
  collection_id?: string | null;
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

export interface ObservabilitySummary {
  query_latency: { count: number; average_seconds: number };
  retrieval: { hit_rate: number; requests: number; hits: number };
  documents: { failed_processing_count: number };
  openai: { estimated_cost_usd: number };
  queues: Record<string, number>;
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
