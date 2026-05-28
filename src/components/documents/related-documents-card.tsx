import { ArrowRight, GitCompareArrows, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentConnection } from "@/lib/types";

interface RelatedDocumentsCardProps {
  currentDocumentId: string;
  items: DocumentConnection[];
  loading?: boolean;
}

export function RelatedDocumentsCard({ currentDocumentId, items, loading = false }: RelatedDocumentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <div className="font-jetbrains text-xs text-neutral-500">Finding connections...</div> : null}
        {!loading && items.length ? (
          items.map((item) => (
            <div key={item.document.id} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/documents/${item.document.id}`} className="line-clamp-2 text-sm font-medium text-white hover:text-neutral-200">
                    {item.document.title}
                  </Link>
                  <div className="font-jetbrains mt-1 text-xs text-neutral-500">{item.document.type}</div>
                </div>
                <Link href={`/documents/${item.document.id}`} className="mt-0.5 text-neutral-500 hover:text-white" aria-label="Open document">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.reasons.slice(0, 3).map((reason) => (
                  <span key={reason} className="font-jetbrains rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-neutral-400">
                    {reason}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/chat?document=${item.document.id}`} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1.5 text-xs text-neutral-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask
                </Link>
                <Link href={`/compare?left=${currentDocumentId}&right=${item.document.id}`} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1.5 text-xs text-neutral-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white">
                  <GitCompareArrows className="h-3.5 w-3.5" />
                  Compare
                </Link>
              </div>
            </div>
          ))
        ) : null}
        {!loading && !items.length ? <div className="font-jetbrains text-xs leading-6 text-neutral-500">No strong connections yet.</div> : null}
      </CardContent>
    </Card>
  );
}
