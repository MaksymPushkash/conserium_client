"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, Network } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  createKnowledgeGraphConcern,
  createNote,
  getKnowledgeGraph,
  getKnowledgeGraphInsights,
  ignoreTopic,
  listCollections,
  mergeTopic,
  pinTopic,
  renameTopic,
} from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

import { GraphCanvas } from "./_components/graph-canvas";
import { GraphFilters, type GraphFiltersValue } from "./_components/graph-filters";
import { GraphInspector } from "./_components/graph-inspector";
import { clusterGraph } from "./_components/graph-layout";
import { GraphListView } from "./_components/graph-list-view";
import { GraphSideTools } from "./_components/graph-side-tools";
import { GraphStats, ViewButton } from "./_components/graph-shared";
import type { GraphTool, GraphView, PositionedNode } from "./_components/graph-types";
import { useKnowledgeGraphLayout } from "./_hooks/use-knowledge-graph-layout";

export default function GraphPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<GraphView>(() => graphViewFromParam(searchParams.get("view")));
  const [activeTool, setActiveTool] = useState<GraphTool>("knowledge");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [filters, setFilters] = useState<GraphFiltersValue>(() => graphFiltersFromParams(searchParams));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => searchParams.get("node"));
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [concernText, setConcernText] = useState("");

  const collectionsQuery = useQuery({ queryKey: ["collections", "graph"], queryFn: () => listCollections({ limit: 100 }) });
  const graphQuery = useQuery({
    queryKey: ["knowledge-graph", filters],
    queryFn: () =>
      getKnowledgeGraph({
        document_limit: 120,
        topic_limit: 40,
        collection_id: filters.collectionId || null,
        tag: filters.tag.trim() || null,
        topic: filters.topic || null,
        document_type: filters.documentType || null,
        recency_days: filters.recencyDays ? Number(filters.recencyDays) : null,
      }),
  });
  const insightsQuery = useQuery({
    queryKey: ["knowledge-graph", "insights", filters],
    queryFn: () =>
      getKnowledgeGraphInsights({
        document_limit: 120,
        topic_limit: 40,
        collection_id: filters.collectionId || null,
        tag: filters.tag.trim() || null,
        topic: filters.topic || null,
        document_type: filters.documentType || null,
        recency_days: filters.recencyDays ? Number(filters.recencyDays) : null,
      }),
  });
  const graph = graphQuery.data;
  const concernMutation = useMutation({
    mutationFn: createKnowledgeGraphConcern,
    onSuccess: () => setConcernText(""),
  });
  const noteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (note) => router.push(`/notes?note=${note.id}`),
  });
  const topicManagementMutation = useMutation({
    mutationFn: (action: TopicManagementAction) => {
      if (action.type === "rename") return renameTopic(action.name, { display_name: action.displayName });
      if (action.type === "merge") return mergeTopic(action.name, { source_names: action.sourceNames });
      if (action.type === "pin") return pinTopic(action.name, action.pinned);
      return ignoreTopic(action.name, action.ignored);
    },
    onSuccess: (topic, action) => {
      void queryClient.invalidateQueries({ queryKey: ["knowledge-graph"] });
      void queryClient.invalidateQueries({ queryKey: ["topics"] });
      const renamed = action.type === "rename" && topic.name !== action.name;
      setFilters((current) => {
        if (!current.topic || current.topic === topic.name || !topic.source_names.includes(current.topic)) return current;
        const next = { ...current, topic: topic.name };
        replaceGraphUrl({ filters: next, nodeId: renamed ? `topic:${topic.name}` : selectedNodeId });
        return next;
      });
      if (renamed) setSelectedNodeId(`topic:${topic.name}`);
    },
  });

  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const clusters = useMemo(() => clusterGraph(nodes, edges), [nodes, edges]);
  const availableTopics = useMemo(() => {
    const topics = nodes
      .filter((node) => node.kind === "topic")
      .sort((left, right) => Number(Boolean(right.is_pinned)) - Number(Boolean(left.is_pinned)) || left.label.localeCompare(right.label))
      .map((node) => node.label);
    return filters.topic && !topics.includes(filters.topic) ? [filters.topic, ...topics] : topics;
  }, [filters.topic, nodes]);
  const { layout, filteredLayout, selectedNode, focusedNodeId, focusedIds, selectedConnections } = useKnowledgeGraphLayout({
    nodes,
    edges,
    query,
    selectedNodeId,
    hoveredNodeId,
  });

  const replaceGraphUrl = useCallback(
    (next: { view?: GraphView; query?: string; nodeId?: string | null; filters?: GraphFiltersValue }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextView = next.view ?? view;
      const nextQuery = next.query ?? query;
      const nextNodeId = next.nodeId === undefined ? selectedNodeId : next.nodeId;
      const nextFilters = next.filters ?? filters;
      if (nextView === "graph") params.delete("view");
      else params.set("view", nextView);
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      else params.delete("q");
      if (nextNodeId) params.set("node", nextNodeId);
      else params.delete("node");
      setOrDelete(params, "collection", nextFilters.collectionId);
      setOrDelete(params, "tag", nextFilters.tag.trim());
      setOrDelete(params, "topic", nextFilters.topic);
      setOrDelete(params, "type", nextFilters.documentType);
      setOrDelete(params, "recency", nextFilters.recencyDays);
      const suffix = params.toString();
      router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
    },
    [filters, pathname, query, router, searchParams, selectedNodeId, view],
  );

  useEffect(() => {
    const nextView = graphViewFromParam(searchParams.get("view"));
    const nextQuery = searchParams.get("q") ?? "";
    const nextNodeId = searchParams.get("node");
    const nextFilters = graphFiltersFromParams(searchParams);
    setView(nextView);
    setQuery(nextQuery);
    setFilters(nextFilters);
    setSelectedNodeId(nextNodeId);
  }, [searchParams]);

  function selectNode(node: PositionedNode) {
    setSelectedNodeId(node.id);
    setActiveTool("knowledge");
    replaceGraphUrl({ nodeId: node.id });
  }

  function resetGraph() {
    setQuery("");
    setFilters(emptyGraphFilters());
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    replaceGraphUrl({ query: "", filters: emptyGraphFilters(), nodeId: null });
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
            <GraphFilters
              value={filters}
              collections={collectionsQuery.data?.items ?? []}
              topics={availableTopics}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                setSelectedNodeId(null);
                replaceGraphUrl({ filters: nextFilters, nodeId: null });
              }}
              onReset={() => {
                const nextFilters = emptyGraphFilters();
                setFilters(nextFilters);
                setSelectedNodeId(null);
                replaceGraphUrl({ filters: nextFilters, nodeId: null });
              }}
            />
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
            insights={insightsQuery.data?.items ?? null}
            nodes={filteredLayout.nodes}
            selectedNode={selectedNode}
            selectedConnections={selectedConnections}
            concernText={concernText}
            concernSaved={concernMutation.isSuccess}
            concernSaving={concernMutation.isPending}
            concernError={concernMutation.error ? errorMessage(concernMutation.error) : null}
            noteSaving={noteMutation.isPending}
            noteError={noteMutation.error ? errorMessage(noteMutation.error) : null}
            topicActionPending={topicManagementMutation.isPending}
            topicActionError={topicManagementMutation.error ? errorMessage(topicManagementMutation.error) : null}
            ignoredVisible={false}
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
            onCreateNote={() => {
              if (!selectedNode) return;
              noteMutation.mutate({
                title: `Graph: ${selectedNode.label}`,
                content: noteContentFromNode(selectedNode, selectedConnections),
                collection_id: selectedNode.collection_id ?? (filters.collectionId || null),
              });
            }}
            onRenameTopic={(displayName) => {
              if (selectedNode?.kind !== "topic") return;
              topicManagementMutation.mutate({ type: "rename", name: selectedNode.label, displayName });
            }}
            onMergeTopic={(sourceNames) => {
              if (selectedNode?.kind !== "topic") return;
              topicManagementMutation.mutate({ type: "merge", name: selectedNode.label, sourceNames });
            }}
            onPinTopic={() => {
              if (selectedNode?.kind !== "topic") return;
              topicManagementMutation.mutate({ type: "pin", name: selectedNode.label, pinned: !selectedNode.is_pinned });
            }}
            onIgnoreTopic={() => {
              if (selectedNode?.kind !== "topic") return;
              topicManagementMutation.mutate({ type: "ignore", name: selectedNode.label, ignored: !selectedNode.is_ignored });
            }}
            onSelectNode={selectNode}
          />
        </section>
      ) : (
        <GraphListView clusters={clusters} nodeCount={layout.nodes.length} edgeCount={layout.edges.length} />
      )}
    </div>
  );
}

type TopicManagementAction =
  | { type: "rename"; name: string; displayName: string }
  | { type: "merge"; name: string; sourceNames: string[] }
  | { type: "pin"; name: string; pinned: boolean }
  | { type: "ignore"; name: string; ignored: boolean };

function graphViewFromParam(value: string | null): GraphView {
  return value === "list" ? "list" : "graph";
}

function graphFiltersFromParams(params: URLSearchParams): GraphFiltersValue {
  return {
    collectionId: params.get("collection") ?? "",
    tag: params.get("tag") ?? "",
    topic: params.get("topic") ?? "",
    documentType: params.get("type") ?? "",
    recencyDays: params.get("recency") ?? "",
  };
}

function emptyGraphFilters(): GraphFiltersValue {
  return { collectionId: "", tag: "", topic: "", documentType: "", recencyDays: "" };
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function noteContentFromNode(node: PositionedNode, connections: PositionedNode[]) {
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
