import { useMemo } from "react";

import type { KnowledgeGraphEdge, KnowledgeGraphNode } from "@/lib/types";

import { buildGraphLayout, filterGraphLayout, getConnectedNodes, getFocusedIds } from "../_components/graph-layout";

export function useKnowledgeGraphLayout({
  nodes,
  edges,
  query,
  selectedNodeId,
  hoveredNodeId,
}: {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  query: string;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
}) {
  const layout = useMemo(() => buildGraphLayout(nodes, edges), [nodes, edges]);
  const filteredLayout = useMemo(() => filterGraphLayout(layout.nodes, layout.edges, query), [layout, query]);
  const selectedNode = selectedNodeId ? filteredLayout.nodesById.get(selectedNodeId) ?? null : null;
  const focusedNodeId = hoveredNodeId ?? selectedNode?.id ?? null;
  const focusedIds = useMemo(() => getFocusedIds(focusedNodeId, filteredLayout.edges), [focusedNodeId, filteredLayout.edges]);
  const selectedConnections = useMemo(
    () => getConnectedNodes(selectedNode?.id ?? null, filteredLayout.nodesById, filteredLayout.edges),
    [selectedNode, filteredLayout],
  );

  return { layout, filteredLayout, selectedNode, focusedNodeId, focusedIds, selectedConnections };
}
