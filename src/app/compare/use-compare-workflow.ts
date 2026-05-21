"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { compareDocuments, exportMarkdown, listDocuments } from "@/lib/api";
import { downloadBlob } from "@/lib/download";

export const focusExamples = [
  "Architecture differences",
  "Conflicting claims",
  "Implementation tradeoffs",
  "Summary comparison",
];

export function useCompareWorkflow() {
  const [leftDocumentId, setLeftDocumentId] = useState("");
  const [rightDocumentId, setRightDocumentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const documentsQuery = useQuery({
    queryKey: ["documents", "compare"],
    queryFn: () => listDocuments({ limit: 100, status: "READY" }),
  });
  const documents = documentsQuery.data?.items ?? [];
  const leftDocument = useMemo(
    () => documents.find((document) => document.id === leftDocumentId) ?? null,
    [documents, leftDocumentId],
  );
  const rightDocument = useMemo(
    () => documents.find((document) => document.id === rightDocumentId) ?? null,
    [documents, rightDocumentId],
  );
  const compareMutation = useMutation({ mutationFn: compareDocuments });
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") =>
      exportMarkdown({
        title: compareMutation.data
          ? `${compareMutation.data.left_title} vs ${compareMutation.data.right_title}`
          : "Cortex comparison",
        markdown: compareMutation.data?.markdown ?? "",
        format,
      }),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const canCompare = Boolean(leftDocumentId && rightDocumentId && leftDocumentId !== rightDocumentId);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canCompare) return;
    compareMutation.mutate({
      left_document_id: leftDocumentId,
      right_document_id: rightDocumentId,
      prompt: prompt.trim() || null,
      limit: 12,
    });
  }

  return {
    leftDocumentId,
    setLeftDocumentId,
    rightDocumentId,
    setRightDocumentId,
    prompt,
    setPrompt,
    documentsQuery,
    documents,
    leftDocument,
    rightDocument,
    compareMutation,
    compareSources: compareMutation.data?.sources ?? [],
    exportMutation,
    canCompare,
    submit,
  };
}
