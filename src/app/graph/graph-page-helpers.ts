import type { GraphFiltersValue } from "./_components/graph-filters";
import type { GraphView, PositionedNode } from "./_components/graph-types";

export function graphViewFromParam(value: string | null): GraphView {
  return value === "list" ? "list" : "graph";
}

export function graphFiltersFromParams(params: URLSearchParams): GraphFiltersValue {
  return {
    collectionId: params.get("collection") ?? "",
    tag: params.get("tag") ?? "",
    topic: params.get("topic") ?? "",
    documentType: params.get("type") ?? "",
    recencyDays: params.get("recency") ?? "",
  };
}

export function emptyGraphFilters(): GraphFiltersValue {
  return { collectionId: "", tag: "", topic: "", documentType: "", recencyDays: "" };
}

export function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function noteContentFromNode(node: PositionedNode, connections: PositionedNode[]) {
  const connected = connections.slice(0, 8).map((connection) => `- ${connection.label} (${connection.kind})`).join("\n");
  return [
    `# ${node.label}`,
    "",
    `Type: ${node.kind}`,
    node.detail ? `Detail: ${node.detail}` : null,
    node.summary ? `Summary: ${node.summary}` : null,
    connections.length ? "Connected nodes:" : null,
    connected || null,
  ].filter(Boolean).join("\n");
}
