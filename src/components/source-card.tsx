import { FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { QuerySource } from "@/lib/types";

export function SourceCard({ source, index, onPreview }: { source: QuerySource; index?: number; onPreview?: (source: QuerySource) => void }) {
  const citation = citationLabel(source, index);
  const pageLabel = source.page_number ? `Page ${source.page_number}` : `Chunk ${source.chunk_index}`;
  const confidence = source.score !== null ? confidenceLabel(source.score) : "confidence unavailable";

  return (
    <Card id={`source-${citation.replace(/\D/g, "")}`} className="scroll-mt-4 border-white/10 bg-black/40">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-light text-white">
              <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
              <span className="truncate">{source.document_title ?? "Untitled source"}</span>
            </div>
            <div className="font-jetbrains mt-1 text-xs font-light text-neutral-500">
              {pageLabel} · {confidence}
            </div>
          </div>
          <Badge className="font-jetbrains font-light">{citation}</Badge>
        </div>

        <p className="line-clamp-4 text-sm font-light leading-6 text-neutral-300">{source.content}</p>

        <details className="rounded-md border border-white/10 bg-white/[0.025] p-3">
          <summary className="cursor-pointer text-sm font-medium text-neutral-200">Why this source?</summary>
          <div className="mt-2 text-sm leading-6 text-neutral-400">
            Retrieved from {source.document_title ?? "this document"} at {pageLabel.toLowerCase()} with {confidence}.
            {source.used_in_answer ? " The answer cited this source directly." : " It was retrieved as supporting context."}
          </div>
        </details>

        <div className="font-jetbrains flex items-center justify-end gap-3 text-xs font-light text-neutral-500">
          {onPreview ? (
            <button type="button" className="text-neutral-300 underline-offset-4 hover:underline" onClick={() => onPreview(source)}>
              Preview
            </button>
          ) : null}
          <Link className="text-neutral-300 underline-offset-4 hover:underline" href={`/documents/${source.document_id}?chunk=${source.chunk_id}`}>
            Open document
          </Link>
        </div>

      </CardContent>
    </Card>
  );
}

function citationLabel(source: QuerySource, index?: number) {
  return source.citation ?? `[${index ?? source.chunk_index + 1}]`;
}

function confidenceLabel(score: number) {
  return `score ${score.toFixed(3)}`;
}
