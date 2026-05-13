"use client";

import { useEffect, useState } from "react";

interface PendingDelete {
  ids: string[];
  label: string;
  timeoutId: number;
}

interface UseUndoableDocumentDeleteOptions {
  onDeleteOne: (documentId: string) => void;
  onDeleteMany: (documentIds: string[]) => void;
}

export function useUndoableDocumentDelete({ onDeleteOne, onDeleteMany }: UseUndoableDocumentDeleteOptions) {
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    return () => {
      if (pendingDelete) window.clearTimeout(pendingDelete.timeoutId);
    };
  }, [pendingDelete]);

  function scheduleDelete(ids: string[], label: string) {
    if (pendingDelete) window.clearTimeout(pendingDelete.timeoutId);
    const timeoutId = window.setTimeout(() => {
      if (ids.length === 1) onDeleteOne(ids[0]);
      else onDeleteMany(ids);
      setPendingDelete(null);
    }, 5000);
    setPendingDelete({ ids, label, timeoutId });
  }

  function undoDelete() {
    if (!pendingDelete) return;
    window.clearTimeout(pendingDelete.timeoutId);
    setPendingDelete(null);
  }

  return { pendingDelete, scheduleDelete, undoDelete };
}
