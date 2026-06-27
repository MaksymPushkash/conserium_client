import type { ApiSchema } from "./generated";

export type QueryRequest = ApiSchema<"QueryRequest">;
export type QuerySource = ApiSchema<"QuerySourceResponse">;
export type RefragChunk = ApiSchema<"RefragChunkResponse">;
export type RefragContext = ApiSchema<"RefragContextResponse">;
export type QueryDebug = ApiSchema<"QueryDebugResponse">;
export type PublicAnswerShareSource = ApiSchema<"PublicAnswerShareSourceResponse">;
export type AnswerShareSource = ApiSchema<"AnswerShareSourceResponse">;
export type PublicAnswerShare = ApiSchema<"PublicAnswerShareResponse">;
export type AnswerShare = ApiSchema<"AnswerShareResponse">;
export type AnswerShareListResponse = ApiSchema<"AnswerShareListResponse">;
export type QueryResponse = ApiSchema<"QueryResponse">;

export interface QueryStreamDone {
  query_id: string;
  conversation_id: string;
  eval_scores: Record<string, unknown>;
  trace_id: string | null;
  suggested_follow_up_questions?: string[];
}

export type QueryStreamEventName = "metadata" | "token" | "sources" | "debug" | "refrag_context" | "done" | "error";

export interface QueryStreamEvent {
  event: QueryStreamEventName;
  data: Record<string, unknown>;
}

export type PublicCollectionQueryResponse = ApiSchema<"PublicCollectionQueryResponse">;
