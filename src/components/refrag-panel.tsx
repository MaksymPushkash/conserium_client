import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RefragChunk, RefragContext } from "@/lib/types";

export function RefragPanel({ context }: { context: RefragContext | null | undefined }) {
  if (!context) {
    return <div className="text-sm text-neutral-500">No REFRAG context yet.</div>;
  }

  return (
    <Card className="border-white/10 bg-white/[0.015]">
      <CardHeader>
        <CardTitle className="text-lg font-normal text-white">RAG debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2 text-xs">
          <Metric label="strategy" value={context.compression_strategy} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="original tokens" value={String(context.total_original_tokens)} />
            <Metric label="context tokens" value={String(context.total_context_tokens)} />
          </div>
        </div>
        <ChunkSection title="Full context" chunks={context.full_text_chunks} />
        <ChunkSection title="Compressed context" chunks={context.compressed_chunks} />
        <ChunkSection title="Discarded" chunks={context.discarded_chunks} muted />
      </CardContent>
    </Card>
  );
}

function ChunkSection({ title, chunks, muted = false }: { title: string; chunks: RefragChunk[]; muted?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="font-jetbrains text-xs uppercase tracking-normal text-neutral-500">{title}</div>
      {chunks.length ? chunks.map((chunk) => <ChunkDebugCard key={chunk.chunk_id} chunk={chunk} muted={muted} />) : <div className="text-xs text-neutral-600">None</div>}
    </div>
  );
}

function ChunkDebugCard({ chunk, muted }: { chunk: RefragChunk; muted: boolean }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-light text-white">{chunk.document_title ?? "Untitled"}</div>
          <div className="font-jetbrains mt-1 text-xs text-neutral-500">
            {chunk.citation ?? "not cited"} · chunk {chunk.chunk_index}
            {chunk.page_number ? ` · page ${chunk.page_number}` : ""}
          </div>
        </div>
        <Badge className="font-jetbrains shrink-0 font-light">{chunk.representation}</Badge>
      </div>
      <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
        <Metric label="score" value={chunk.score === null ? "-" : chunk.score.toFixed(4)} />
        <Metric label="original" value={String(chunk.original_token_count)} />
        <Metric label="context" value={String(chunk.context_token_count)} />
      </div>
      <p className={muted ? "line-clamp-3 text-xs font-light leading-5 text-neutral-600" : "line-clamp-5 text-xs font-light leading-5 text-neutral-300"}>
        {chunk.context_text || "Excluded from final prompt context."}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-black/40 p-2">
      <div className="font-jetbrains truncate text-neutral-500">{label}</div>
      <div className="font-jetbrains mt-1 break-words font-light leading-5 text-white">{value}</div>
    </div>
  );
}
