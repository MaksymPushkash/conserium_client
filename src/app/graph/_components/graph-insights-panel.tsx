import type { KnowledgeGraphInsight, KnowledgeGraphNode } from "@/lib/types";

import type { PositionedNode } from "./graph-types";

export function GraphInsights({
  insights,
  clusters,
  nodes,
  onSelectNode,
}: {
  insights: KnowledgeGraphInsight[] | null;
  clusters: Array<{ topic: KnowledgeGraphNode; documents: KnowledgeGraphNode[] }>;
  nodes: PositionedNode[];
  onSelectNode: (node: PositionedNode) => void;
}) {
  if (insights?.length) {
    const positionedById = new Map(nodes.map((node) => [node.id, node]));
    return (
      <div className="space-y-3">
        {insights.map((item) => (
          <div key={item.kind} className="rounded-lg border border-white/10 bg-black/35 p-3">
            <div className="flex items-start justify-between gap-3">
              <span>
                <span className="font-jetbrains block text-xs uppercase tracking-[0.14em] text-neutral-500">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-neutral-500">{item.description}</span>
              </span>
              <span className="text-lg font-medium text-white">{item.count}</span>
            </div>
            {item.nodes.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.nodes.slice(0, 4).map((node) => {
                  const positioned = positionedById.get(node.id);
                  return positioned ? (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => onSelectNode(positioned)}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300 transition hover:border-white/25 hover:text-white"
                    >
                      {node.label}
                    </button>
                  ) : (
                    <span key={node.id} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-neutral-500">
                      {node.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  const isolatedTopics = nodes.filter((node) => node.kind === "topic" && node.degree === 0);
  const pinnedTopics = nodes.filter((node) => node.kind === "topic" && node.is_pinned);
  const overConnectedDocuments = nodes.filter((node) => node.kind === "document" && node.degree >= 4);
  const thinClusters = clusters.filter((cluster) => cluster.documents.length < 2);
  const staleClusters = clusters.filter((cluster) => cluster.documents.length > 0 && cluster.documents.every(isStaleNode));
  const insightRows = [
    { label: "Isolated topics", value: isolatedTopics.length, nodes: isolatedTopics },
    { label: "Pinned topics", value: pinnedTopics.length, nodes: pinnedTopics },
    { label: "Over-connected docs", value: overConnectedDocuments.length, nodes: overConnectedDocuments },
    { label: "Thin clusters", value: thinClusters.length, nodes: thinClusters.map((cluster) => nodes.find((node) => node.id === cluster.topic.id)).filter((node): node is PositionedNode => Boolean(node)) },
    { label: "Stale clusters", value: staleClusters.length, nodes: staleClusters.map((cluster) => nodes.find((node) => node.id === cluster.topic.id)).filter((node): node is PositionedNode => Boolean(node)) },
  ];

  return (
    <div className="space-y-3">
      {insightRows.map((row) => (
        <div key={row.label} className="rounded-lg border border-white/10 bg-black/35 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">{row.label}</span>
            <span className="text-lg font-medium text-white">{row.value}</span>
          </div>
          {row.nodes.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {row.nodes.slice(0, 4).map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectNode(node)}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300 transition hover:border-white/25 hover:text-white"
                >
                  {node.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function isStaleNode(node: KnowledgeGraphNode) {
  const value = node.updated_at ?? node.created_at;
  if (!value) return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp > 1000 * 60 * 60 * 24 * 180;
}
