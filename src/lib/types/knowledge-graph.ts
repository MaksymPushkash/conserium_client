export interface KnowledgeGraphNode {
  id: string;
  kind: "topic" | "document";
  label: string;
  detail: string | null;
  collection_id?: string | null;
  summary?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  suggested_questions?: string[] | null;
  source_names?: string[];
  is_pinned?: boolean;
  is_ignored?: boolean;
}

export interface KnowledgeGraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  label: string;
  score: number;
}

export interface KnowledgeGraphResponse {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface KnowledgeGraphInsight {
  kind: string;
  title: string;
  description: string;
  severity: "info" | "low" | "medium" | "high" | string;
  count: number;
  nodes: KnowledgeGraphNode[];
}

export interface KnowledgeGraphInsightsResponse {
  items: KnowledgeGraphInsight[];
}

export interface KnowledgeGraphConcern {
  id: string;
  node_id: string | null;
  node_kind: string | null;
  node_label: string | null;
  message: string;
  status: string;
  created_at: string;
}
