"use client";

import { useEffect } from "react";

interface UseNoteAutosaveOptions {
  selectedId: string | null;
  loadedNoteId: string | null;
  title: string;
  content: string;
  pending: boolean;
  lastSavedRef: { current: string };
  serialize: (title: string, content: string) => string;
  save: () => void;
  delayMs: number;
}

export function useNoteAutosave({
  selectedId,
  loadedNoteId,
  title,
  content,
  pending,
  lastSavedRef,
  serialize,
  save,
  delayMs,
}: UseNoteAutosaveOptions) {
  useEffect(() => {
    if (!selectedId || pending || loadedNoteId !== selectedId) return;
    const snapshot = serialize(title, content);
    if (snapshot === lastSavedRef.current) return;
    const timeout = window.setTimeout(save, delayMs);
    return () => window.clearTimeout(timeout);
  }, [content, delayMs, lastSavedRef, loadedNoteId, pending, save, selectedId, serialize, title]);
}
