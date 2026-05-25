"use client";

import { FileSearch } from "lucide-react";

import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DocumentListItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function CompareDocumentSelect({
  label,
  value,
  documents,
  onChange,
}: {
  label: string;
  value: string;
  documents: DocumentListItem[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-jetbrains text-xs text-neutral-400">{label}</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select document</option>
        {documents.map((document) => (
          <option key={document.id} value={document.id}>
            {document.title}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function CompareDocumentPreview({ document, fallback }: { document: DocumentListItem | null; fallback: string }) {
  if (!document) {
    return (
      <div className="font-jetbrains rounded-xl border border-dashed border-white/10 bg-white/[0.035] p-4 text-sm text-neutral-400">
        <FileSearch className="mb-3 h-4 w-4 text-neutral-500" />
        {fallback}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{document.title}</h3>
          <p className="font-jetbrains mt-1 text-xs text-neutral-400">
            {document.type} / {document.word_count ?? 0} words / {formatDateTime(document.created_at)}
          </p>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <p className="font-jetbrains mt-3 line-clamp-3 text-sm leading-5 text-neutral-300">
        {document.summary || "No summary available yet."}
      </p>
    </div>
  );
}
