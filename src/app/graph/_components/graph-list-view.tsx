import { Network } from "lucide-react";
import Link from "next/link";

import type { KnowledgeGraphNode } from "@/lib/types";

import { documentHref } from "./graph-layout";
import { EmptyGraph, GraphStats } from "./graph-shared";

export function GraphListView({
  clusters,
  nodeCount,
  edgeCount,
}: {
  clusters: Array<{ topic: KnowledgeGraphNode; documents: KnowledgeGraphNode[] }>;
  nodeCount: number;
  edgeCount: number;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-xl border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-base font-medium text-white">Clusters</h2>
        </div>
        <div className="p-4">
          {clusters.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {clusters.map((cluster) => (
                <div key={cluster.topic.id} className="rounded-lg border border-white/10 bg-black/40 p-4 transition-colors hover:bg-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-neutral-500" />
                    <Link href={`/topics/${encodeURIComponent(cluster.topic.label)}`} className="truncate text-sm font-medium text-white hover:underline">
                      {cluster.topic.label}
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {cluster.documents.map((document) => (
                      <Link
                        key={document.id}
                        href={documentHref(document)}
                        className="rounded-md border border-white/10 bg-black/60 p-3 text-sm text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                      >
                        <span className="block truncate">{document.label}</span>
                        {document.detail ? <span className="font-jetbrains mt-1 block text-xs text-neutral-600">{document.detail}</span> : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyGraph />
          )}
        </div>
      </div>

      <GraphStats nodes={nodeCount} edges={edgeCount} topics={clusters.length} />
    </section>
  );
}
