import type { ApiSchema } from "./generated";

export type DocumentType = ApiSchema<"DocumentType">;
export type DocumentStatus = ApiSchema<"DocumentStatus">;
export type DocumentActivityTemperature = "hot" | "cold" | "forgotten" | string;

export type MetadataItem = Record<string, unknown>;

export type DocumentResponse = ApiSchema<"DocumentResponse">;
export type DocumentListItem = ApiSchema<"DocumentListItemResponse">;
export type DocumentListResponse = ApiSchema<"DocumentListResponse">;
export type DocumentSearchResult = ApiSchema<"DocumentSearchResultResponse">;
export type DocumentSearchResponse = ApiSchema<"DocumentSearchResponse">;
export type DocumentProcessingStep = ApiSchema<"DocumentProcessingStepResponse">;
export type DocumentStatusResponse = ApiSchema<"DocumentStatusResponse">;
export type DocumentChunkResponse = ApiSchema<"DocumentChunkResponse">;
export type DocumentQuestionHistoryItem = ApiSchema<"DocumentQuestionHistoryItemResponse">;
export type DocumentQuestionHistoryResponse = ApiSchema<"DocumentQuestionHistoryResponse">;
export type DocumentConnection = ApiSchema<"DocumentConnectionResponse">;
export type DocumentConnectionsResponse = ApiSchema<"DocumentConnectionsResponse">;
export type IngestDocumentRequest = ApiSchema<"IngestDocumentRequest">;
