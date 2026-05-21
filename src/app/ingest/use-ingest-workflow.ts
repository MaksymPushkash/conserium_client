"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, FileUp, ImageIcon, LinkIcon, Youtube } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { getDocumentStatus, ingestDocument, ingestFile, listCollections } from "@/lib/api";
import type { DocumentResponse, DocumentType } from "@/lib/types";

export type Mode = "TEXT" | "URL" | "YOUTUBE" | "PDF" | "IMAGE";

export const modes: Mode[] = ["TEXT", "URL", "YOUTUBE", "PDF", "IMAGE"];

export const modeConfig: Record<Mode, { label: string; description: string; icon: typeof FileText }> = {
  TEXT: { label: "Text", description: "Paste notes, drafts, or markdown.", icon: FileText },
  URL: { label: "URL", description: "Import an article or web page.", icon: LinkIcon },
  YOUTUBE: { label: "YouTube", description: "Extract transcript and context.", icon: Youtube },
  PDF: { label: "PDF", description: "Upload a document file.", icon: FileUp },
  IMAGE: { label: "Image", description: "Upload visual source material.", icon: ImageIcon },
};

export function useIngestWorkflow() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("TEXT");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [trackedDocument, setTrackedDocument] = useState<DocumentResponse | null>(null);
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "PDF" || mode === "IMAGE") {
        if (!file) throw new Error("Select a file first");
        return ingestFile(mode.toLowerCase() as "pdf" | "image", {
          file,
          title: title || file.name,
          collection_id: collectionId,
          language: language || undefined,
        });
      }
      return ingestDocument({
        title,
        type: mode as DocumentType,
        raw_content: mode === "TEXT" ? rawContent : null,
        source_url: mode === "URL" || mode === "YOUTUBE" ? sourceUrl : null,
        collection_id: collectionId,
        language: language || null,
      });
    },
    onSuccess: (document) => {
      setTrackedDocument(document);
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const statusQuery = useQuery({
    queryKey: ["document-status", trackedDocument?.id],
    queryFn: () => getDocumentStatus(trackedDocument!.id),
    enabled: Boolean(trackedDocument?.id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "READY" || status === "FAILED" ? false : 2000;
    },
  });

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (mode === "TEXT") return Boolean(rawContent.trim());
    if (mode === "URL" || mode === "YOUTUBE") return Boolean(sourceUrl.trim());
    return Boolean(file);
  }, [file, mode, rawContent, sourceUrl, title]);

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  function selectDroppedFile(selected: File | null) {
    setFile(selected);
    if (selected?.type === "application/pdf") setMode("PDF");
    if (selected?.type.startsWith("image/")) setMode("IMAGE");
    if (selected && !title) setTitle(selected.name);
  }

  return {
    mode,
    setMode,
    title,
    setTitle,
    language,
    setLanguage,
    collectionId,
    setCollectionId,
    rawContent,
    setRawContent,
    sourceUrl,
    setSourceUrl,
    file,
    setFile,
    trackedDocument,
    collectionsQuery,
    mutation,
    status: statusQuery.data,
    canSubmit,
    submit,
    selectDroppedFile,
  };
}
