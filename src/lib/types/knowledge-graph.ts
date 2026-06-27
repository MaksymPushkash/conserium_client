import type { ApiSchema } from "./generated";

export type KnowledgeGraphNode = ApiSchema<"KnowledgeGraphNodeResponse">;
export type KnowledgeGraphEdge = ApiSchema<"KnowledgeGraphEdgeResponse">;
export type KnowledgeGraphResponse = ApiSchema<"KnowledgeGraphResponse">;
export type KnowledgeGraphInsight = ApiSchema<"KnowledgeGraphInsightResponse">;
export type KnowledgeGraphInsightsResponse = ApiSchema<"KnowledgeGraphInsightsResponse">;
export type KnowledgeGraphConcern = ApiSchema<"KnowledgeGraphConcernResponse">;
