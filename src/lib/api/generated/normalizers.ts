import type {
  AnswerShare,
  AnswerShareListResponse,
  ChatDetailResponse,
  Collection,
  CollectionAuditEventListResponse,
  CollectionListResponse,
  CollectionMember,
  CollectionMemberListResponse,
  CollectionWorkspace,
  CompareDocumentsResponse,
  CompareListResponse,
  DocumentConnectionsResponse,
  DocumentListItem,
  DocumentListResponse,
  DocumentResponse,
  DocumentSearchResponse,
  DocumentStatusResponse,
  DraftDetail,
  DraftResponse,
  DraftVersionListResponse,
  Flashcard,
  FlashcardListResponse,
  GenerateFlashcardsResponse,
  KnowledgeGapArea,
  KnowledgeGapListResponse,
  KnowledgeGapResponse,
  KnowledgeGraphInsightsResponse,
  KnowledgeGraphNode,
  KnowledgeGraphResponse,
  LearningGoal,
  LearningPath,
  LearningPathListResponse,
  LearningPathStep,
  Note,
  NoteVersion,
  ObservabilitySummary,
  AnswerShareSource,
  PublicAnswerShare,
  PublicAnswerShareSource,
  PublicAskEventListResponse,
  PublicCollectionQueryResponse,
  PublicCollectionResponse,
  QueryDebug,
  QueryResponse,
  QuerySource,
  Quiz,
  QuizAttempt,
  QuizAttemptListResponse,
  QuizListResponse,
  QuizOption,
  QuizQuestion,
  RepoSyncRunResponse,
  Topic,
  TopicDetailResponse,
  TopicEvent,
  TopicListResponse,
  WorkspaceMember,
  WorkspaceMemberListResponse,
} from "@/lib/types";

import type { ApiSchema } from "./client";

type JsonObject = Record<string, unknown>;

export function normalizeQuerySource(source: ApiSchema<"QuerySourceResponse">): QuerySource {
  return {
    chunk_id: source.chunk_id,
    document_id: source.document_id,
    document_title: source.document_title,
    content: source.content,
    page_number: source.page_number,
    chunk_index: source.chunk_index,
    score: source.score,
    citation: source.citation,
    used_in_answer: source.used_in_answer,
  };
}

export function normalizeQueryResponse(response: ApiSchema<"QueryResponse">): QueryResponse {
  return {
    conversation_id: response.conversation_id,
    query: response.query,
    answer: response.answer,
    sources: response.sources.map(normalizeQuerySource),
    refrag_context: response.refrag_context,
    debug: response.debug ? normalizeQueryDebug(response.debug) : null,
    suggested_follow_up_questions: response.suggested_follow_up_questions,
  };
}

export function normalizeChatDetail(response: ApiSchema<"ChatDetailResponse">): ChatDetailResponse {
  return {
    session: response.session,
    messages: response.messages.map((message) => ({
      ...message,
      sources: message.sources?.map(normalizeQuerySource) ?? null,
      refrag_context: message.refrag_context,
    })),
  };
}

export function normalizeCompare(response: ApiSchema<"CompareDocumentsResponse">): CompareDocumentsResponse {
  return {
    ...response,
    created_at: response.created_at ?? null,
    evidence_rows: response.evidence_rows.map((row) => ({
      ...row,
      left_source_id: row.left_source_id ?? null,
      right_source_id: row.right_source_id ?? null,
      left_citation: row.left_citation ?? null,
      right_citation: row.right_citation ?? null,
    })),
    sources: response.sources.map(normalizeQuerySource),
  };
}

export function normalizeCompareList(response: ApiSchema<"CompareListResponse">): CompareListResponse {
  return { ...response, items: response.items.map(normalizeCompare) };
}

export function normalizeDocument(document: ApiSchema<"DocumentResponse">): DocumentResponse {
  return {
    ...document,
    entities: document.entities ?? null,
    categories: document.categories ?? null,
    visual_metadata: document.visual_metadata ?? null,
    suggested_questions: document.suggested_questions ?? [],
    tags: document.tags ?? [],
    last_used_at: document.last_used_at ?? null,
  };
}

export function normalizeDocumentListItem(document: ApiSchema<"DocumentListItemResponse">): DocumentListItem {
  return {
    ...document,
    suggested_questions: document.suggested_questions ?? [],
    tags: document.tags ?? [],
    last_used_at: document.last_used_at ?? null,
  };
}

export function normalizeDocumentList(response: ApiSchema<"DocumentListResponse">): DocumentListResponse {
  return { ...response, items: response.items.map(normalizeDocumentListItem) };
}

export function normalizeDocumentSearch(response: ApiSchema<"DocumentSearchResponse">): DocumentSearchResponse {
  return {
    ...response,
    items: response.items.map((item) => ({ ...item, document: normalizeDocumentListItem(item.document) })),
  };
}

export function normalizeDocumentStatus(response: ApiSchema<"DocumentStatusResponse">): DocumentStatusResponse {
  return {
    ...response,
    failure_reason: response.failure_reason ?? null,
    timeline: (response.timeline ?? []).map((step) => ({ ...step, message: step.message ?? null })),
  };
}

export function normalizeDocumentConnections(response: ApiSchema<"DocumentConnectionsResponse">): DocumentConnectionsResponse {
  return {
    ...response,
    items: response.items.map((item) => ({ ...item, document: normalizeDocumentListItem(item.document) })),
  };
}

export function normalizeTopic(topic: ApiSchema<"TopicResponse">): Topic {
  return { ...topic, source_names: topic.source_names ?? [] };
}

export function normalizeTopicEvent(event: ApiSchema<"TopicEventResponse">): TopicEvent {
  return { ...event, source_names: event.source_names ?? [] };
}

export function normalizeTopicList(response: ApiSchema<"TopicListResponse">): TopicListResponse {
  return { ...response, items: response.items.map(normalizeTopic) };
}

export function normalizeTopicDetail(response: ApiSchema<"TopicDetailResponse">): TopicDetailResponse {
  return {
    ...response,
    topic: normalizeTopic(response.topic),
    events: (response.events ?? []).map(normalizeTopicEvent),
  };
}

export function normalizeKnowledgeGapArea(area: ApiSchema<"KnowledgeGapAreaResponse">): KnowledgeGapArea {
  return {
    ...area,
    evidence_titles: area.evidence_titles ?? [],
    missing_source_types: area.missing_source_types ?? [],
    suggested_actions: area.suggested_actions ?? [],
  };
}

export function normalizeKnowledgeGap(gap: ApiSchema<"KnowledgeGapResponse">): KnowledgeGapResponse {
  return {
    ...gap,
    collection_id: gap.collection_id ?? null,
    areas: (gap.areas ?? []).map(normalizeKnowledgeGapArea),
    missing_source_types: gap.missing_source_types ?? [],
    suggested_actions: gap.suggested_actions ?? [],
  };
}

export function normalizeKnowledgeGapList(response: ApiSchema<"KnowledgeGapListResponse">): KnowledgeGapListResponse {
  return { ...response, items: response.items.map(normalizeKnowledgeGap) };
}

export function normalizeKnowledgeGraphResponse(response: ApiSchema<"KnowledgeGraphResponse">): KnowledgeGraphResponse {
  return {
    edges: response.edges,
    nodes: response.nodes.map(normalizeKnowledgeGraphNode),
  };
}

export function normalizeKnowledgeGraphInsights(
  response: ApiSchema<"KnowledgeGraphInsightsResponse">,
): KnowledgeGraphInsightsResponse {
  return {
    items: response.items.map((item) => ({
      ...item,
      nodes: (item.nodes ?? []).map(normalizeKnowledgeGraphNode),
    })),
  };
}

export function normalizeLearningGoal(goal: ApiSchema<"LearningGoalResponse">): LearningGoal {
  return { ...goal, gaps: goal.gaps.map(normalizeKnowledgeGapArea) };
}

export function normalizeRepoSyncRun(response: ApiSchema<"RepoSyncRunResponse">): RepoSyncRunResponse {
  return { ...response, warnings: response.warnings ?? [] };
}

export function normalizeCollection(collection: ApiSchema<"CollectionResponse">): Collection {
  return collection;
}

export function normalizeCollectionList(response: ApiSchema<"CollectionListResponse">): CollectionListResponse {
  return { ...response, items: response.items.map(normalizeCollection) };
}

export function normalizeCollectionWorkspace(response: ApiSchema<"CollectionWorkspaceResponse">): CollectionWorkspace {
  return {
    ...response,
    collection: normalizeCollection(response.collection),
    gaps: response.gaps.map((gap) => ({
      ...gap,
      id: gap.id ?? null,
      topic: gap.topic ?? null,
      coverage_ratio: gap.coverage_ratio ?? null,
      missing_source_types: gap.missing_source_types ?? [],
      suggested_actions: gap.suggested_actions ?? [],
    })),
    recent_comparisons: response.recent_comparisons ?? [],
    recent_drafts: response.recent_drafts ?? [],
  };
}

export function normalizeCollectionMember(member: ApiSchema<"CollectionMemberResponse">): CollectionMember {
  return { ...member, invite_status: "active", role: normalizeMemberRole(member.role) };
}

export function normalizeCollectionMemberList(
  response: ApiSchema<"CollectionMemberListResponse">,
): CollectionMemberListResponse {
  return { ...response, items: response.items.map(normalizeCollectionMember) };
}

export function normalizeWorkspaceMember(member: ApiSchema<"WorkspaceMemberResponse">): WorkspaceMember {
  return { ...member, role: normalizeMemberRole(member.role) };
}

export function normalizeWorkspaceMemberList(response: ApiSchema<"WorkspaceMemberListResponse">): WorkspaceMemberListResponse {
  return { ...response, items: response.items.map(normalizeWorkspaceMember) };
}

export function normalizeNote(note: ApiSchema<"NoteResponse">): Note {
  return note;
}

export function normalizeNoteVersions(versions: ApiSchema<"NoteVersionResponse">[]): NoteVersion[] {
  return versions;
}

export function normalizeDraftDetail(response: ApiSchema<"DraftDetailResponse">): DraftDetail {
  return { ...response, sources: response.sources.map(normalizeQuerySource) };
}

export function normalizeDraftVersions(response: ApiSchema<"DraftVersionListResponse">): DraftVersionListResponse {
  return { ...response, items: response.items.map((item) => ({ ...item, sources: item.sources.map(normalizeQuerySource) })) };
}

export function normalizeDraft(response: ApiSchema<"DraftResponse">): DraftResponse {
  return { ...response, sources: response.sources.map(normalizeQuerySource) };
}

export function normalizeFlashcard(flashcard: ApiSchema<"FlashcardResponse">): Flashcard {
  return flashcard;
}

export function normalizeFlashcardList(response: ApiSchema<"FlashcardListResponse">): FlashcardListResponse {
  return { ...response, items: response.items.map(normalizeFlashcard) };
}

export function normalizeGenerateFlashcards(response: ApiSchema<"GenerateFlashcardsResponse">): GenerateFlashcardsResponse {
  return { ...response, items: response.items.map(normalizeFlashcard) };
}

export function normalizeQuiz(response: ApiSchema<"QuizResponse">): Quiz {
  return { ...response, questions: response.questions.map(normalizeQuizQuestion) };
}

export function normalizeQuizAttempt(response: ApiSchema<"QuizAttemptResponse">): QuizAttempt {
  return { ...response, answers: response.answers.map(normalizeQuizAttemptAnswer) };
}

export function normalizeQuizList(response: ApiSchema<"QuizListResponse">): QuizListResponse {
  return { ...response, items: response.items.map(normalizeQuiz) };
}

export function normalizeQuizAttemptList(response: ApiSchema<"QuizAttemptListResponse">): QuizAttemptListResponse {
  return { ...response, items: response.items.map(normalizeQuizAttempt) };
}

export function normalizeLearningPath(response: ApiSchema<"LearningPathResponse">): LearningPath {
  return { ...response, steps: response.steps.map(normalizeLearningPathStep) };
}

export function normalizeLearningPathList(response: ApiSchema<"LearningPathListResponse">): LearningPathListResponse {
  return { ...response, items: response.items.map(normalizeLearningPath) };
}

export function normalizeObservabilitySummary(response: ApiSchema<"ObservabilitySummaryResponse">): ObservabilitySummary {
  return { ...response, queues: response.queues ?? {} };
}

export function normalizePublicAskEvents(response: ApiSchema<"PublicAskEventListResponse">): PublicAskEventListResponse {
  return { items: response.items ?? [] };
}

export function normalizePublicCollection(response: ApiSchema<"PublicCollectionResponse">): PublicCollectionResponse {
  return {
    ...response,
    documents: (response.documents ?? []).map((document) => ({ ...document, tags: document.tags ?? [] })),
  };
}

export function normalizePublicAnswerShare(response: ApiSchema<"PublicAnswerShareResponse">): PublicAnswerShare {
  return { ...response, sources: response.sources.map(normalizePublicQuerySource) };
}

export function normalizePublicCollectionQuery(
  response: ApiSchema<"PublicCollectionQueryResponse">,
): PublicCollectionQueryResponse {
  return {
    ...response,
    sources: response.sources.map(normalizePublicQuerySource),
    share: normalizePublicAnswerShare(response.share),
  };
}

export function normalizeAnswerShareList(response: ApiSchema<"AnswerShareListResponse">): AnswerShareListResponse {
  return { ...response, items: response.items.map(normalizeAnswerShare) };
}

function normalizeAnswerShare(response: ApiSchema<"AnswerShareResponse">): AnswerShare {
  return { ...response, sources: response.sources.map(normalizeAnswerShareSource) };
}

function normalizePublicQuerySource(source: ApiSchema<"PublicQuerySourceResponse">): PublicAnswerShareSource {
  return source;
}

function normalizeAnswerShareSource(source: ApiSchema<"AnswerShareSourceResponse">): AnswerShareSource {
  return source;
}

function normalizeKnowledgeGraphNode(node: ApiSchema<"KnowledgeGraphNodeResponse">): KnowledgeGraphNode {
  return {
    ...node,
    kind: normalizeKnowledgeGraphNodeKind(node.kind),
    detail: node.detail ?? null,
  };
}

function normalizeKnowledgeGraphNodeKind(kind: string): "topic" | "document" {
  return kind === "topic" ? "topic" : "document";
}

function normalizeQuizQuestion(value: JsonObject): QuizQuestion {
  return {
    id: stringValue(value.id),
    question: stringValue(value.question),
    options: arrayValue(value.options).map(normalizeQuizOption),
    correct_option_id: stringValue(value.correct_option_id),
    explanation: stringValue(value.explanation),
    weak_area: stringValue(value.weak_area),
    source_document_id: optionalStringValue(value.source_document_id),
    source_title: optionalStringValue(value.source_title),
  };
}

function normalizeQuizOption(value: unknown): QuizOption {
  const option = objectValue(value);
  return {
    id: stringValue(option.id),
    text: stringValue(option.text),
  };
}

function normalizeQuizAttemptAnswer(value: JsonObject): QuizAttempt["answers"][number] {
  return {
    question_id: stringValue(value.question_id),
    option_id: stringValue(value.option_id),
    correct: booleanValue(value.correct),
    correct_option_id: stringValue(value.correct_option_id),
    weak_area: optionalStringValue(value.weak_area),
  };
}

function normalizeLearningPathStep(value: JsonObject): LearningPathStep {
  return {
    id: stringValue(value.id),
    title: stringValue(value.title),
    focus: stringValue(value.focus),
    summary: stringValue(value.summary),
    source_document_id: optionalStringValue(value.source_document_id),
    status: stringValue(value.status),
  };
}

function normalizeQueryDebug(debug: ApiSchema<"QueryDebugResponse">): QueryDebug {
  return {
    ...debug,
    retrieved_sources: debug.retrieved_sources.map(normalizeQuerySource),
    final_sources: debug.final_sources.map(normalizeQuerySource),
    used_sources: debug.used_sources.map(normalizeQuerySource),
    filtered_sources: debug.filtered_sources.map(normalizeQuerySource),
  };
}

function objectValue(value: unknown): JsonObject {
  return isJsonObject(value) ? value : {};
}

function isJsonObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeMemberRole(role: string): CollectionMember["role"] {
  return role === "editor" ? "editor" : "viewer";
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function optionalStringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function booleanValue(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
