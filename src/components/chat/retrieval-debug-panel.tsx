"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueryDebug, QuerySource } from "@/lib/types";

export function RetrievalDebugPanel({ debug }: { debug?: QueryDebug }) {
  if (!debug) {
    return (
      <Card className="border-white/10 bg-white/[0.015]">
        <CardHeader>
          <CardTitle className="text-lg font-normal text-white">Retrieval debug</CardTitle>
        </CardHeader>
        <CardContent className="font-jetbrains text-xs font-light leading-6 text-neutral-500">
          Retrieval path will appear after a query.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.015]">
      <CardHeader>
        <CardTitle className="text-lg font-normal text-white">Retrieval debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="font-jetbrains space-y-2 text-xs font-light leading-5 text-neutral-400">
          <div><span className="text-neutral-600">Original</span> {debug.original_query}</div>
          <div><span className="text-neutral-600">Retrieval</span> {debug.retrieval_query}</div>
          <div><span className="text-neutral-600">Collection</span> {debug.selected_collection_id ?? "all"}</div>
          <div><span className="text-neutral-600">Tags</span> {debug.selected_tags.length ? debug.selected_tags.join(", ") : "all"}</div>
        </div>
        <DebugSourceList title="Retrieved top-k" sources={debug.retrieved_sources} />
        <DebugSourceList title="Used in answer" sources={debug.used_sources} />
        <DebugSourceList title="Filtered out" sources={debug.filtered_sources} />
      </CardContent>
    </Card>
  );
}

function DebugSourceList({ title, sources }: { title: string; sources: QuerySource[] }) {
  return (
    <div>
      <div className="font-jetbrains mb-2 text-xs font-light uppercase tracking-[0.2em] text-neutral-600">{title}</div>
      {sources.length ? (
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div key={`${title}-${source.chunk_id}-${index}`} className="rounded-md border border-white/10 bg-white/[0.035] p-2">
              <div className="truncate text-xs text-neutral-200">{index + 1}. {source.document_title ?? source.document_id}</div>
              <div className="font-jetbrains mt-1 text-[11px] font-light text-neutral-500">
                chunk {source.chunk_index} · page {source.page_number ?? "n/a"} · score {formatScore(source.score)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="font-jetbrains text-xs font-light text-neutral-600">None</div>
      )}
    </div>
  );
}

function formatScore(score: number | null) {
  return typeof score === "number" ? score.toFixed(4) : "n/a";
}
