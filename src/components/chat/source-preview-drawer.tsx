"use client";

import { X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { QuerySource } from "@/lib/types";

export function SourcePreviewDrawer({ source, onClose }: { source: QuerySource; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-auto border-l border-white/10 bg-black p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-light text-white">{source.document_title ?? "Untitled source"}</div>
            <div className="font-jetbrains mt-2 text-xs font-light text-neutral-500">
              chunk {source.chunk_index} · page {source.page_number ?? "n/a"} · score {formatScore(source.score)}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close source preview">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm font-light leading-7 text-neutral-200">
          {source.content}
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="text-sm font-medium text-white">Why this source?</div>
          <div className="mt-2 text-sm leading-6 text-neutral-400">
            Retrieved from {source.document_title ?? "this document"} at chunk {source.chunk_index}
            {source.page_number ? `, page ${source.page_number}` : ""} with score {formatScore(source.score)}.
            {source.used_in_answer ? " The answer cited this source directly." : " It was retrieved as supporting context."}
          </div>
        </div>
        <Link href={`/documents/${source.document_id}?chunk=${source.chunk_id}`} className="mt-6 inline-flex">
          <Button variant="secondary" className="font-normal">Open document</Button>
        </Link>
      </aside>
    </div>
  );
}

function formatScore(score: number | null) {
  return typeof score === "number" ? score.toFixed(4) : "n/a";
}
