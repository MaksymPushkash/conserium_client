import { FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { QuerySource } from "@/lib/types";

export function SourceCard({ source, index }: { source: QuerySource; index?: number }) {
  const citation = citationLabel(source, index);

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
              chunk {source.chunk_index}
              {source.page_number ? ` · page ${source.page_number}` : ""}
              {" · "}
              {source.used_in_answer ? "used in answer" : "retrieved only"}
            </div>
          </div>
          <Badge className="font-jetbrains font-light">{citation}</Badge>
        </div>
        <p className="line-clamp-5 text-sm font-light leading-6 text-neutral-300">{source.content}</p>
        <div className="font-jetbrains flex items-center justify-between gap-3 text-xs font-light text-neutral-500">
          <span>{source.score !== null ? `score ${source.score.toFixed(3)}` : "score unavailable"}</span>
          <Link className="text-neutral-300 underline-offset-4 hover:underline" href={`/documents/${source.document_id}?chunk=${source.chunk_id}`}>
            Open chunk
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function citationLabel(source: QuerySource, index?: number) {
  return source.citation ?? `[${index ?? source.chunk_index + 1}]`;
}
