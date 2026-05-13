"use client";

import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DocumentsBulkActionsProps {
  count: number;
  reprocessPending: boolean;
  deletePending: boolean;
  onReprocess: () => void;
  onDelete: () => void;
}

export function DocumentsBulkActions({ count, reprocessPending, deletePending, onReprocess, onDelete }: DocumentsBulkActionsProps) {
  return (
    <div className="flex gap-2">
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
