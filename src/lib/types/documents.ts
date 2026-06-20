import type { ApiSchema, RequiredApiFields } from "./generated";

export type DocumentType = ApiSchema<"DocumentType">;
export type DocumentStatus = ApiSchema<"DocumentStatus">;
export type DocumentActivityTemperature = "hot" | "cold" | "forgotten" | string;

export type MetadataItem = Record<string, unknown>;

type NormalizedDocument = RequiredApiFields<
  ApiSchema<"DocumentResponse">,
  "categories" | "entities" | "last_used_at" | "suggested_questions" | "tags" | "visual_metadata"
>;
export type DocumentResponse = Omit<NormalizedDocument, "activity_temperature"> & {
  activity_temperature: DocumentActivityTemperature;
};
type NormalizedDocumentListItem = RequiredApiFields<
  ApiSchema<"DocumentListItemResponse">,
  "last_used_at" | "suggested_questions" | "tags"
>;
export type DocumentListItem = Omit<NormalizedDocumentListItem, "activity_temperature"> & {
  activity_temperature: DocumentActivityTemperature;
};
export type DocumentListResponse = Omit<ApiSchema<"DocumentListResponse">, "items"> & { items: DocumentListItem[] };
export type DocumentSearchResult = Omit<ApiSchema<"DocumentSearchResultResponse">, "document"> & {
  document: DocumentListItem;
};
export type DocumentSearchResponse = Omit<ApiSchema<"DocumentSearchResponse">, "items"> & {
  items: DocumentSearchResult[];
};
export type DocumentProcessingStep = RequiredApiFields<ApiSchema<"DocumentProcessingStepResponse">, "message">;
type NormalizedDocumentStatus = RequiredApiFields<ApiSchema<"DocumentStatusResponse">, "failure_reason" | "timeline">;
export type DocumentStatusResponse = Omit<NormalizedDocumentStatus, "timeline"> & { timeline: DocumentProcessingStep[] };
export type DocumentChunkResponse = ApiSchema<"DocumentChunkResponse">;
export type DocumentQuestionHistoryItem = ApiSchema<"DocumentQuestionHistoryItemResponse">;
export type DocumentQuestionHistoryResponse = ApiSchema<"DocumentQuestionHistoryResponse">;
export type DocumentConnection = Omit<ApiSchema<"DocumentConnectionResponse">, "document"> & {
  document: DocumentListItem;
};
export type DocumentConnectionsResponse = Omit<ApiSchema<"DocumentConnectionsResponse">, "items"> & {
  items: DocumentConnection[];
};
export type IngestDocumentPayload = ApiSchema<"IngestDocumentRequest">;
