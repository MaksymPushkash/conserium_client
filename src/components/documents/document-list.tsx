"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";

import { DocumentActivityIndicator } from "@/components/documents/document-activity-indicator";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import type { DocumentListItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface DocumentListProps {
  documents: DocumentListItem[];
  selectedIds: Set<string>;
  searchSnippets?: Record<string, string>;
  onToggleSelected: (documentId: string) => void;
  onDelete: (documentId: string, title: string) => void;
}

export function DocumentList({ documents, selectedIds, searchSnippets = {}, onToggleSelected, onDelete }: DocumentListProps) {
  return (
    <div className="divide-y divide-white/10">
      {documents.map((document) => {
        const searchSnippet = searchSnippets[document.id];
        return (
          <div key={document.id} className="grid gap-3 py-4 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center">
            <input
              type="checkbox"
              checked={selectedIds.has(document.id)}
              onChange={() => onToggleSelected(document.id)}
              className="h-4 w-4 accent-white"
            />
            <Link href={`/documents/${document.id}`} className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="truncate font-normal text-neutral-100">{document.title}</div>
                <DocumentActivityIndicator temperature={document.activity_temperature} />
              </div>
              <div className="font-jetbrains mt-1 text-sm text-neutral-500">
                {document.type} · {document.language ?? "unknown language"} · {formatDateTime(document.created_at)}
              </div>
              {searchSnippet ? (
                <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-neutral-300">{searchSnippet}</p>
              ) : document.summary ? (
                <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-neutral-400">{document.summary}</p>
              ) : null}
              {document.tags.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {document.tags.map((documentTag) => (
                    <span key={documentTag} className="font-jetbrains rounded-md border border-white/10 px-2 py-0.5 text-xs text-neutral-500">
                      {documentTag}
                    </span>
                  ))}
                </div>
              ) : null}
              {document.is_duplicate ? <div className="mt-1 text-xs text-red-400">Possible duplicate of {document.duplicate_of_id}</div> : null}
            </Link>
            <div className="font-jetbrains text-sm text-neutral-500">{document.word_count ?? "—"} words</div>
            <StatusPill status={document.status} />
            <Button variant="danger" size="icon" onClick={() => onDelete(document.id, document.title)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      {!documents.length ? <div className="py-10 text-center text-sm text-neutral-500">No documents match.</div> : null}
    </div>
  );
}
