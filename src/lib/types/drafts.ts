import type { DocumentType } from "./documents";
import type { ApiSchema } from "./generated";
import type { QuerySource } from "./query";

export type DraftGenerateRequest = Omit<ApiSchema<"DraftGenerateRequest">, "document_types"> & {
  document_types?: DocumentType[] | null;
};
export type DraftTemplate = ApiSchema<"DraftTemplateResponse">;
export type DraftTemplateListResponse = ApiSchema<"DraftTemplateListResponse">;
export type DraftOutlineResponse = ApiSchema<"DraftOutlineResponse">;
export type DraftResponse = Omit<ApiSchema<"DraftResponse">, "sources"> & { sources: QuerySource[] };

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
export type DraftDetail = Omit<ApiSchema<"DraftDetailResponse">, "sources"> & { sources: QuerySource[] };
export type DraftVersion = Omit<ApiSchema<"DraftVersionResponse">, "sources"> & { sources: QuerySource[] };
export type DraftVersionListResponse = Omit<ApiSchema<"DraftVersionListResponse">, "items"> & {
  items: DraftVersion[];
};
