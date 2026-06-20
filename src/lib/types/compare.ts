import type { QuerySource } from "./query";
import type { ApiSchema, RequiredApiFields } from "./generated";

export type CompareDocumentsRequest = ApiSchema<"CompareDocumentsRequest">;
export type CompareEvidenceRow = RequiredApiFields<
  ApiSchema<"CompareEvidenceRowResponse">,
  "left_citation" | "left_source_id" | "right_citation" | "right_source_id"
>;
type NormalizedCompare = RequiredApiFields<ApiSchema<"CompareDocumentsResponse">, "created_at">;
export type CompareDocumentsResponse = Omit<NormalizedCompare, "evidence_rows" | "sources"> & {
  evidence_rows: CompareEvidenceRow[];
  sources: QuerySource[];
};
export type CompareListResponse = Omit<ApiSchema<"CompareListResponse">, "items"> & {
  items: CompareDocumentsResponse[];
};
