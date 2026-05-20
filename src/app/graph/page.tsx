"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { List, Network } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { createKnowledgeGraphConcern, getKnowledgeGraph } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

import { GraphCanvas } from "./_components/graph-canvas";
import { GraphInspector } from "./_components/graph-inspector";
import { clusterGraph } from "./_components/graph-layout";
import { GraphListView } from "./_components/graph-list-view";
import { GraphSideTools } from "./_components/graph-side-tools";
import { GraphStats, ViewButton } from "./_components/graph-shared";
import type { GraphTool, GraphView, PositionedNode } from "./_components/graph-types";
import { useKnowledgeGraphLayout } from "./_hooks/use-knowledge-graph-layout";

export default function GraphPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<GraphView>(() => graphViewFromParam(searchParams.get("view")));
  const [activeTool, setActiveTool] = useState<GraphTool>("knowledge");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => searchParams.get("node"));
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [concernText, setConcernText] = useState("");

  const graphQuery = useQuery({
    queryKey: ["knowledge-graph"],
    queryFn: () => getKnowledgeGraph({ document_limit: 120, topic_limit: 40 }),
  });
  const graph = graphQuery.data;
  const concernMutation = useMutation({
    mutationFn: createKnowledgeGraphConcern,
    onSuccess: () => setConcernText(""),
  });

  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const clusters = useMemo(() => clusterGraph(nodes, edges), [nodes, edges]);
  const { layout, filteredLayout, selectedNode, focusedNodeId, focusedIds, selectedConnections } = useKnowledgeGraphLayout({
    nodes,
    edges,
    query,
    selectedNodeId,
    hoveredNodeId,
  });

  const replaceGraphUrl = useCallback(
    (next: { view?: GraphView; query?: string; nodeId?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextView = next.view ?? view;
      const nextQuery = next.query ?? query;
      const nextNodeId = next.nodeId === undefined ? selectedNodeId : next.nodeId;
      if (nextView === "graph") params.delete("view");
      else params.set("view", nextView);
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      else params.delete("q");
      if (nextNodeId) params.set("node", nextNodeId);
      else params.delete("node");
      const suffix = params.toString();
      router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
    },
    [pathname, query, router, searchParams, selectedNodeId, view],
  );

  useEffect(() => {
    const nextView = graphViewFromParam(searchParams.get("view"));
    const nextQuery = searchParams.get("q") ?? "";
    const nextNodeId = searchParams.get("node");
    setView(nextView);
    setQuery(nextQuery);
    setSelectedNodeId(nextNodeId);
  }, [searchParams]);

  function selectNode(node: PositionedNode) {
    setSelectedNodeId(node.id);
    setActiveTool("knowledge");
    replaceGraphUrl({ nodeId: node.id });
  }

  function resetGraph() {
    setQuery("");
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    replaceGraphUrl({ query: "", nodeId: null });
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-jetbrains text-xs uppercase tracking-[0.2em] text-neutral-600">Workspace map</p>
          <h1 className="mt-3 text-4xl font-normal tracking-normal text-white">Knowledge Graph</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Navigate topics and source documents as a connected workspace. Click any node to inspect its context.
          </p>
        </div>
        <div className="inline-flex w-fit rounded-full border border-white/10 bg-black/60 p-1">
          <ViewButton
            active={view === "graph"}
            onClick={() => {
              setView("graph");
              replaceGraphUrl({ view: "graph" });
            }}
            icon={Network}
            label="Graph"
          />
          <ViewButton
            active={view === "list"}
            onClick={() => {
              setView("list");
              replaceGraphUrl({ view: "list" });
            }}
            icon={List}
            label="List"
          />
        </div>
      </header>

      {graphQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(graphQuery.error)}
        </div>
      ) : null}

      {view === "graph" ? (
        <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
          <aside className="space-y-3">
            <GraphSideTools activeTool={activeTool} onActiveToolChange={setActiveTool} />
            <GraphStats nodes={nodes.length} edges={edges.length} topics={clusters.length} />
          </aside>

          <GraphCanvas
            nodes={filteredLayout.nodes}
            edges={filteredLayout.edges}
            nodesById={filteredLayout.nodesById}
            focusedNodeId={focusedNodeId}
            focusedIds={focusedIds}
            selectedNodeId={selectedNode?.id ?? null}
            query={query}
            onQueryChange={(value) => {
              setQuery(value);
              replaceGraphUrl({ query: value });
            }}
            onSelectNode={selectNode}
            onHoverNode={setHoveredNodeId}
            onReset={resetGraph}
          />

          <GraphInspector
            activeTool={activeTool}
            clusters={clusters}
            nodes={filteredLayout.nodes}
            selectedNode={selectedNode}
            selectedConnections={selectedConnections}
            concernText={concernText}
            concernSaved={concernMutation.isSuccess}
            concernSaving={concernMutation.isPending}
            concernError={concernMutation.error ? errorMessage(concernMutation.error) : null}
            onConcernTextChange={(value) => {
              setConcernText(value);
              concernMutation.reset();
            }}
            onSaveConcern={() =>
              concernMutation.mutate({
                message: concernText,
                node_id: selectedNode?.id ?? null,
                node_kind: selectedNode?.kind ?? null,
                node_label: selectedNode?.label ?? null,
              })
            }
            onSelectNode={selectNode}
          />
        </section>
      ) : (
        <GraphListView clusters={clusters} nodeCount={layout.nodes.length} edgeCount={layout.edges.length} />
      )}
    </div>
  );
}

function graphViewFromParam(value: string | null): GraphView {
  return value === "list" ? "list" : "graph";
}
