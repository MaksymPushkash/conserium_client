"use client";

import { useMemo } from "react";

import type { Collection, DocumentListItem } from "@/lib/types";

export function useChatSuggestions(collections: Collection[] = [], documents: DocumentListItem[] = []) {
  const suggestionChips = useMemo(() => {
    const chips: string[] = [];
    for (const collection of collections) {
      if (chips.length >= 6) break;
      chips.push(`What is in ${collection.name}?`);
    }
    for (const document of documents) {
      if (chips.length >= 8) break;
      for (const suggestedQuestion of document.suggested_questions ?? []) {
        if (chips.length >= 8) break;
        chips.push(suggestedQuestion);
      }
      if (chips.length >= 8) break;
      chips.push(`Summarize ${document.title}`);
      for (const tag of document.tags ?? []) {
        if (chips.length >= 8) break;
        chips.push(`Find ${tag} references`);
      }
    }
    return Array.from(new Set(chips)).slice(0, 8);
  }, [collections, documents]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const document of documents) {
      for (const documentTag of document.tags ?? []) {
        tags.add(documentTag);
      }
    }
    return [...tags].sort((left, right) => left.localeCompare(right));
  }, [documents]);

  return {
    suggestionChips,
    availableTags,
    hasReadyDocuments: documents.length > 0,
  };
}
