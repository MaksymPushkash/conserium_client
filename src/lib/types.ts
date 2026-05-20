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

export interface CompareDocumentsRequest {
  left_document_id: string;
  right_document_id: string;
  prompt?: string | null;
  limit?: number;
}

export interface CompareDocumentsResponse {
  left_document_id: string;
  right_document_id: string;
  left_title: string;
  right_title: string;
  markdown: string;
  sources: QuerySource[];
}

export interface KnowledgeGraphNode {
  id: string;
  kind: "topic" | "document";
  label: string;
  detail: string | null;
}

export interface KnowledgeGraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  label: string;
  score: number;
}

export interface KnowledgeGraphResponse {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface KnowledgeGraphConcern {
  id: string;
  node_id: string | null;
  node_kind: string | null;
  node_label: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface KnowledgeGapArea {
  name: string;
  covered: boolean;
  evidence_count: number;
  evidence_titles: string[];
}

export interface KnowledgeGapResponse {
  topic: string;
  covered_count: number;
  missing_count: number;
  coverage_ratio: number;
  areas: KnowledgeGapArea[];
}

export interface ConflictDocument {
  id: string;
  title: string;
}

export interface ConflictFinding {
  subject: string;
  summary: string;
  documents: ConflictDocument[];
  evidence: string[];
  score: number;
}

export interface ConflictDetectionResponse {
  collection_id: string | null;
  analyzed_document_count: number;
  conflicts: ConflictFinding[];
}

export interface LearningGoal {
  id: string;
  user_id: string;
  topic: string;
  description: string | null;
  target_date: string | null;
  status: "active" | "paused" | "completed" | string;
  progress_ratio: number;
  covered_count: number;
  missing_count: number;
  gaps: KnowledgeGapArea[];
  recommended_next_areas: string[];
  suggested_resources: SuggestedLearningResource[];
  deadline_status: "none" | "upcoming" | "due_soon" | "overdue" | "completed" | string;
  days_remaining: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface SuggestedLearningResource {
  area: string;
  title: string;
  search_query: string;
  reason: string;
  url: string | null;
}

export interface RankedLearningResource extends SuggestedLearningResource {
  excerpt: string | null;
  score: number;
  cached: boolean;
  refreshed_at: string | null;
}

export interface LearningGoalRequest {
  topic: string;
  description?: string | null;
  target_date?: string | null;
}

export interface LearningGoalUpdateRequest {
  topic?: string | null;
  description?: string | null;
  target_date?: string | null;
  status?: "active" | "paused" | "completed" | null;
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

export interface RepoSync {
  id: string;
  collection_id: string;
  provider: string;
  owner: string;
  repo: string;
  branch: string;
  status: string;
  last_error: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface RepoSyncListResponse {
  items: RepoSync[];
}

export interface RepoSyncRunResponse {
  repo_sync: RepoSync;
  created: number;
  updated: number;
  skipped: number;
  deleted: number;
  warnings: string[];
}

export interface NotionExportResponse {
  page_id: string;
  url: string | null;
}

export interface NotionConnection {
  connected: boolean;
  workspace_id: string | null;
  workspace_name: string | null;
  bot_id: string | null;
  default_parent_page_id: string | null;
  default_parent_page_title: string | null;
}

export interface NotionPage {
  id: string;
  title: string;
}

export interface IntegrationConnectUrlResponse {
  url: string;
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
