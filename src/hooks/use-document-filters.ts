"use client";

import { useMemo, useState } from "react";

import type { DocumentListItem, DocumentStatus, DocumentType } from "@/lib/types";

export const documentTypeOptions: Array<DocumentType | "ALL"> = ["ALL", "TEXT", "URL", "YOUTUBE", "PDF", "IMAGE", "MARKDOWN"];
export const documentStatusOptions: Array<DocumentStatus | "ALL"> = ["ALL", "PENDING", "QUEUED", "PROCESSING", "READY", "FAILED"];

export function useDocumentFilters(documents: DocumentListItem[] = [], initialTag: string | null = null) {
  const [type, setType] = useState<DocumentType | "ALL">("ALL");
  const [status, setStatus] = useState<DocumentStatus | "ALL">("ALL");
  const [collectionId, setCollectionId] = useState<string | "ALL">("ALL");
  const [tag, setTag] = useState<string | "ALL">(initialTag || "ALL");
  const [search, setSearch] = useState("");

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const document of documents) {
      for (const documentTag of document.tags ?? []) tags.add(documentTag);
    }
    return [...tags].sort((left, right) => left.localeCompare(right));
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      if (type !== "ALL" && document.type !== type) return false;
      if (status !== "ALL" && document.status !== status) return false;
      if (collectionId !== "ALL" && document.collection_id !== collectionId) return false;
      if (tag !== "ALL" && !(document.tags ?? []).includes(tag)) return false;
      if (search && !document.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [collectionId, documents, search, status, tag, type]);

  return {
    type,
    setType,
    status,
    setStatus,
    collectionId,
    setCollectionId,
    tag,
    setTag,
    search,
    setSearch,
    availableTags,
    filteredDocuments,
  };
}
