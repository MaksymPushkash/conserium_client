import type { KnowledgeGraphEdge, KnowledgeGraphNode } from "@/lib/types";

import type { PositionedNode } from "./graph-types";

export function clusterGraph(nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  return nodes
    .filter((node) => node.kind === "topic")
    .map((topic) => ({
      topic,
      documents: edges
        .filter((edge) => edge.source_id === topic.id)
        .map((edge) => nodesById.get(edge.target_id))
        .filter((node): node is KnowledgeGraphNode => Boolean(node)),
    }))
    .filter((cluster) => cluster.documents.length > 0);
}

export function buildGraphLayout(nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]) {
  const degreeById = new Map<string, number>();
  edges.forEach((edge) => {
    degreeById.set(edge.source_id, (degreeById.get(edge.source_id) ?? 0) + 1);
    degreeById.set(edge.target_id, (degreeById.get(edge.target_id) ?? 0) + 1);
  });

  const topicNodes = nodes.filter((node) => node.kind === "topic").sort((left, right) => left.label.localeCompare(right.label));
  const documentNodes = nodes.filter((node) => node.kind === "document").sort((left, right) => left.label.localeCompare(right.label));
  const positionedNodes = [
    ...positionRing(topicNodes, 520, 360, 170, degreeById),
    ...positionRing(documentNodes, 520, 360, 300, degreeById, Math.PI / 13),
  ];
  const nodesById = new Map(positionedNodes.map((node) => [node.id, node]));
  return { nodes: positionedNodes, edges, nodesById };
}

export function filterGraphLayout(nodes: PositionedNode[], edges: KnowledgeGraphEdge[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return { nodes, edges, nodesById: new Map(nodes.map((node) => [node.id, node])) };
  }

  const matchingIds = new Set(
    nodes
      .filter((node) => `${node.label} ${node.detail ?? ""}`.toLowerCase().includes(needle))
      .map((node) => node.id),
  );
  edges.forEach((edge) => {
    if (matchingIds.has(edge.source_id) || matchingIds.has(edge.target_id)) {
      matchingIds.add(edge.source_id);
      matchingIds.add(edge.target_id);
    }
  });
  const filteredNodes = nodes.filter((node) => matchingIds.has(node.id));
  const filteredEdges = edges.filter((edge) => matchingIds.has(edge.source_id) && matchingIds.has(edge.target_id));
  return { nodes: filteredNodes, edges: filteredEdges, nodesById: new Map(filteredNodes.map((node) => [node.id, node])) };
}

export function getFocusedIds(nodeId: string | null, edges: KnowledgeGraphEdge[]) {
  const ids = new Set<string>();
  if (!nodeId) return ids;
  ids.add(nodeId);
  edges.forEach((edge) => {
    if (edge.source_id === nodeId) ids.add(edge.target_id);
    if (edge.target_id === nodeId) ids.add(edge.source_id);
  });
  return ids;
}

export function getConnectedNodes(nodeId: string | null, nodesById: Map<string, PositionedNode>, edges: KnowledgeGraphEdge[]) {
  if (!nodeId) return [];
  const ids = new Set<string>();
  edges.forEach((edge) => {
    if (edge.source_id === nodeId) ids.add(edge.target_id);
    if (edge.target_id === nodeId) ids.add(edge.source_id);
  });
  return Array.from(ids)
    .map((id) => nodesById.get(id))
    .filter((node): node is PositionedNode => Boolean(node))
    .sort((left, right) => right.degree - left.degree);
}

export function documentHref(node: KnowledgeGraphNode) {
  return `/documents/${node.id.replace("document:", "")}`;
}

function positionRing(
  nodes: KnowledgeGraphNode[],
  centerX: number,
  centerY: number,
  radius: number,
  degreeById: Map<string, number>,
  offset = 0,
): PositionedNode[] {
  if (!nodes.length) return [];
  return nodes.map((node, index) => {
    const angle = offset + (Math.PI * 2 * index) / nodes.length;
    const degree = degreeById.get(node.id) ?? 0;
    return {
      ...node,
      degree,
      radius: node.kind === "topic" ? 12 + Math.min(degree, 9) * 1.1 : 6 + Math.min(degree, 7) * 0.6,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });
}
