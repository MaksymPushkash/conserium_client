"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  compareDocuments,
  createNote,
  deleteCompareResult,
  exportMarkdown,
  generateDraft,
  getCompareResult,
  listCompareResults,
  listDocuments,
} from "@/lib/api";
import { downloadBlob } from "@/lib/download";
import type { CompareDocumentsResponse } from "@/lib/types";

export const focusExamples = [
  "Architecture differences",
  "Conflicting claims",
  "Implementation tradeoffs",
  "Summary comparison",
];

export const compareDimensions = [
  { id: "claims", label: "Claims" },
  { id: "assumptions", label: "Assumptions" },
  { id: "architecture", label: "Architecture" },
  { id: "tradeoffs", label: "Tradeoffs" },
  { id: "contradictions", label: "Contradictions" },
  { id: "missing_details", label: "Missing details" },
];

export function useCompareWorkflow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leftDocumentId, setLeftDocumentId] = useState(searchParams.get("left") ?? "");
  const [rightDocumentId, setRightDocumentId] = useState(searchParams.get("right") ?? "");
  const [prompt, setPrompt] = useState("");
  const [selectedResultId, setSelectedResultId] = useState(searchParams.get("result") ?? "");
  const [selectedDimensions, setSelectedDimensions] = useState(compareDimensions.map((dimension) => dimension.id));
  const documentsQuery = useQuery({
    queryKey: ["documents", "compare"],
    queryFn: () => listDocuments({ limit: 100, status: "READY" }),
  });
  const historyQuery = useQuery({
    queryKey: ["compare", "results"],
    queryFn: () => listCompareResults({ limit: 20 }),
  });
  const resultQuery = useQuery({
    queryKey: ["compare", "results", selectedResultId],
    queryFn: () => getCompareResult(selectedResultId),
    enabled: Boolean(selectedResultId),
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
  const compareMutation = useMutation({
    mutationFn: compareDocuments,
    onSuccess: (result) => {
      setSelectedResultId(result.id);
      void historyQuery.refetch();
    },
  });
  const activeCompare: CompareDocumentsResponse | null = compareMutation.data ?? resultQuery.data ?? null;
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") =>
      exportMarkdown({
        title: activeCompare
          ? `${activeCompare.left_title} vs ${activeCompare.right_title}`
          : "Conserium comparison",
        markdown: activeCompare?.markdown ?? "",
        format,
      }),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const synthesisNoteMutation = useMutation({
    mutationFn: async () => {
      if (!activeCompare) throw new Error("No comparison selected");
      return createNote({
        title: `Synthesis: ${activeCompare.left_title} vs ${activeCompare.right_title}`,
        collection_id: activeCompare.collection_id,
        content: synthesisNoteContent(activeCompare),
      });
    },
    onSuccess: (note) => router.push(`/notes?note=${note.id}`),
  });
  const decisionMemoMutation = useMutation({
    mutationFn: async () => {
      if (!activeCompare) throw new Error("No comparison selected");
      return generateDraft({
        prompt: `Generate a decision memo from this comparison:\n\n${activeCompare.markdown}`,
        template_id: "comparison_memo",
        scope_type: "documents",
        document_ids: [activeCompare.left_document_id, activeCompare.right_document_id],
        outline: ["Decision", "Evidence", "Tradeoffs", "Recommendation"],
        limit: 12,
      });
    },
    onSuccess: (draft) => router.push(`/drafts?draft=${draft.draft_id}`),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCompareResult,
    onSuccess: () => {
      setSelectedResultId("");
      compareMutation.reset();
      void historyQuery.refetch();
    },
  });
  const canCompare = Boolean(leftDocumentId && rightDocumentId && leftDocumentId !== rightDocumentId);

  function toggleDimension(id: string) {
    setSelectedDimensions((current) =>
      current.includes(id)
        ? current.filter((dimension) => dimension !== id)
        : [...current, id],
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!canCompare) return;
    compareMutation.mutate({
      left_document_id: leftDocumentId,
      right_document_id: rightDocumentId,
      prompt: prompt.trim() || null,
      dimensions: selectedDimensions.length ? selectedDimensions : null,
      limit: 12,
    });
  }

  function selectHistoryItem(id: string) {
    setSelectedResultId(id);
    compareMutation.reset();
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
    historyQuery,
    resultQuery,
    activeCompare,
    selectedResultId,
    setSelectedResultId,
    selectedDimensions,
    toggleDimension,
    compareMutation,
    compareSources: activeCompare?.sources ?? [],
    exportMutation,
    synthesisNoteMutation,
    decisionMemoMutation,
    deleteMutation,
    actionError: exportMutation.error ?? synthesisNoteMutation.error ?? decisionMemoMutation.error ?? deleteMutation.error,
    canCompare,
    selectHistoryItem,
    submit,
  };
}

function synthesisNoteContent(compare: CompareDocumentsResponse) {
  const evidence = compare.evidence_rows
    .map((row) => `- ${row.dimension}: ${row.assessment}`)
    .join("\n");
  return `${compare.markdown}\n\n## Evidence table\n${evidence}`;
}
