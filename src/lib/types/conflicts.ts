import type { components } from "@/lib/api/generated/v1";

type Schemas = components["schemas"];

export type ConflictDocument = Schemas["ConflictDocumentResponse"];
export type ConflictFinding = Schemas["ConflictFindingResponse"];
export type ConflictDetectionResponse = Schemas["ConflictDetectionResponse"];
