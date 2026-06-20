import type { ApiSchema, RequiredApiFields } from "./generated";

export type KnowledgeGapArea = RequiredApiFields<
  ApiSchema<"KnowledgeGapAreaResponse">,
  "evidence_titles" | "missing_source_types" | "suggested_actions"
>;
type NormalizedKnowledgeGap = RequiredApiFields<
  ApiSchema<"KnowledgeGapResponse">,
  "areas" | "collection_id" | "missing_source_types" | "suggested_actions"
>;
export type KnowledgeGapResponse = Omit<NormalizedKnowledgeGap, "areas"> & { areas: KnowledgeGapArea[] };
export type KnowledgeGapListResponse = Omit<ApiSchema<"KnowledgeGapListResponse">, "items"> & {
  items: KnowledgeGapResponse[];
};
