import type { DocumentType } from "./documents";
import type { ApiSchema } from "./generated";

export type QueryRequest = Omit<ApiSchema<"QueryRequest">, "document_types"> & {
  document_types?: DocumentType[] | null;
};
export type QuerySource = ApiSchema<"QuerySourceResponse">;
export type RefragChunk = ApiSchema<"RefragChunkResponse">;
export type RefragContext = ApiSchema<"RefragContextResponse">;
export type QueryDebug = ApiSchema<"QueryDebugResponse">;
export type PublicAnswerShareSource = ApiSchema<"PublicAnswerShareSourceResponse">;
export type AnswerShareSource = ApiSchema<"AnswerShareSourceResponse">;
export type PublicAnswerShare = Omit<ApiSchema<"PublicAnswerShareResponse">, "sources"> & {
  sources: PublicAnswerShareSource[];
};
export type AnswerShare = Omit<ApiSchema<"AnswerShareResponse">, "sources"> & { sources: AnswerShareSource[] };
export type AnswerShareListResponse = Omit<ApiSchema<"AnswerShareListResponse">, "items"> & { items: AnswerShare[] };
export type QueryResponse = Omit<ApiSchema<"QueryResponse">, "debug" | "refrag_context" | "sources"> & {
  sources: QuerySource[];
  refrag_context: RefragContext;
  debug: QueryDebug | null;
};

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

export type PublicCollectionQueryResponse = Omit<ApiSchema<"PublicCollectionQueryResponse">, "share" | "sources"> & {
  sources: PublicAnswerShareSource[];
  share: PublicAnswerShare;
};
