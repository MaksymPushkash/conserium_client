"use client";

import { Download, FolderInput, RotateCcw, Tags, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Collection } from "@/lib/types";

interface DocumentsBulkActionsProps {
  count: number;
  collections: Collection[];
  reprocessPending: boolean;
  deletePending: boolean;
  movePending: boolean;
  tagPending: boolean;
  exportPending: boolean;
  selectedCollectionId: string;
  tagInput: string;
  onCollectionChange: (collectionId: string) => void;
  onTagInputChange: (value: string) => void;
  onMove: () => void;
  onAddTags: () => void;
  onExport: () => void;
  onReprocess: () => void;
  onDelete: () => void;
}

export function DocumentsBulkActions({
  count,
  collections,
  reprocessPending,
  deletePending,
  movePending,
  tagPending,
  exportPending,
  selectedCollectionId,
  tagInput,
  onCollectionChange,
  onTagInputChange,
  onMove,
  onAddTags,
  onExport,
  onReprocess,
  onDelete,
}: DocumentsBulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span className="font-jetbrains text-xs text-neutral-500">{count} selected</span>
      <select
        value={selectedCollectionId}
        onChange={(event) => onCollectionChange(event.target.value)}
        disabled={!count || movePending}
        className="h-9 rounded-md border border-white/10 bg-black px-2 text-sm text-neutral-200 outline-none disabled:opacity-50"
        aria-label="Move selected to collection"
      >
        <option value="">No collection</option>
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.name}
          </option>
        ))}
      </select>
      <Button variant="secondary" disabled={!count || movePending} onClick={onMove}>
        <FolderInput className="h-4 w-4" />
        Move
      </Button>
      <input
        value={tagInput}
        onChange={(event) => onTagInputChange(event.target.value)}
        placeholder="tags"
        disabled={!count || tagPending}
        className="h-9 w-32 rounded-md border border-white/10 bg-black px-2 font-jetbrains text-xs text-neutral-200 outline-none placeholder:text-neutral-600 disabled:opacity-50"
        aria-label="Tags to add"
      />
      <Button variant="secondary" disabled={!count || tagPending || !tagInput.trim()} onClick={onAddTags}>
        <Tags className="h-4 w-4" />
        Tags
      </Button>
      <Button variant="secondary" disabled={!count || exportPending} onClick={onExport}>
        <Download className="h-4 w-4" />
        Export MD
      </Button>
      <Button variant="secondary" disabled={!count || reprocessPending} onClick={onReprocess}>
        <RotateCcw className="h-4 w-4" />
        Reprocess
      </Button>
      <Button variant="danger" disabled={!count || deletePending} onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
