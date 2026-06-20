import type { ApiSchema, RequiredApiFields } from "./generated";

export type KnowledgeGraphNode = Omit<RequiredApiFields<ApiSchema<"KnowledgeGraphNodeResponse">, "detail">, "kind"> & {
  kind: "topic" | "document";
};
export type KnowledgeGraphEdge = ApiSchema<"KnowledgeGraphEdgeResponse">;
export type KnowledgeGraphResponse = Omit<ApiSchema<"KnowledgeGraphResponse">, "nodes"> & {
  nodes: KnowledgeGraphNode[];
};
export type KnowledgeGraphInsight = Omit<
  RequiredApiFields<ApiSchema<"KnowledgeGraphInsightResponse">, "nodes">,
  "nodes"
> & { nodes: KnowledgeGraphNode[] };
export type KnowledgeGraphInsightsResponse = Omit<ApiSchema<"KnowledgeGraphInsightsResponse">, "items"> & {
  items: KnowledgeGraphInsight[];
};
export type KnowledgeGraphConcern = ApiSchema<"KnowledgeGraphConcernResponse">;
