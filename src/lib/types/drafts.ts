import type { ApiSchema } from "./generated";

export type DraftGenerateRequest = ApiSchema<"DraftGenerateRequest">;
export type DraftTemplate = ApiSchema<"DraftTemplateResponse">;
export type DraftTemplateListResponse = ApiSchema<"DraftTemplateListResponse">;
export type DraftOutlineResponse = ApiSchema<"DraftOutlineResponse">;
export type DraftResponse = ApiSchema<"DraftResponse">;

export interface DraftHistoryItem extends DraftResponse {
  id: string;
  title: string;
  collection_id: string | null;
  topic: string | null;
  knowledge_gap_id: string | null;
  created_at: string;
}

export type DraftListItem = ApiSchema<"DraftListItemResponse">;
export type DraftListResponse = ApiSchema<"DraftListResponse">;
export type DraftDetail = ApiSchema<"DraftDetailResponse">;
export type DraftVersion = ApiSchema<"DraftVersionResponse">;
export type DraftVersionListResponse = ApiSchema<"DraftVersionListResponse">;
