"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ClipboardList, FileText, GitCompareArrows } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  exportMarkdown,
  exportNotion,
  generateDraft,
  generateDraftOutline,
  getDraft,
  listCollections,
  listDocuments,
  listDraftTemplates,
  listDraftVersions,
  listDrafts,
  listTopics,
  restoreDraftVersion,
} from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { downloadBlob } from "@/lib/download";
import type { DraftGenerateRequest, DraftListItem } from "@/lib/types";

export const promptSuggestions = [
  {
    title: "Technical brief",
    description: "Concise explanation with cited saved evidence.",
    icon: FileText,
    prompt: "Write a concise technical brief from my saved sources.",
  },
  {
    title: "Implementation plan",
    description: "Turn context into ordered engineering steps.",
    icon: ClipboardList,
    prompt: "Turn these sources into an implementation plan with concrete next steps.",
  },
  {
    title: "Tradeoff analysis",
    description: "Compare options and name risks.",
    icon: GitCompareArrows,
    prompt: "Summarize the tradeoffs, risks, and recommendations. Cite the saved documents.",
  },
  {
    title: "Study notes",
    description: "Convert sources into structured notes.",
    icon: BookOpen,
    prompt: "Create study notes with key concepts, examples, and cited sources.",
  },
];

export function useDraftWorkflow() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [collectionId, setCollectionId] = useState(searchParams.get("collection") ?? "");
  const [topicName, setTopicName] = useState(searchParams.get("topic") ?? "");
  const [scopeType, setScopeType] = useState(searchParams.get("gap") ? "knowledge_gap" : searchParams.get("collection") ? "collection" : searchParams.get("topic") ? "topic" : "all");
  const [templateId, setTemplateId] = useState("brief");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [outlineSections, setOutlineSections] = useState<string[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState(searchParams.get("draft") ?? "");
  const collectionsQuery = useQuery({ queryKey: ["collections", "drafts"], queryFn: () => listCollections({ limit: 100 }) });
  const topicsQuery = useQuery({ queryKey: ["topics", "drafts"], queryFn: () => listTopics({ limit: 100 }) });
  const templatesQuery = useQuery({ queryKey: ["drafts", "templates"], queryFn: listDraftTemplates });
  const draftsQuery = useQuery({
    queryKey: ["drafts", "history", collectionId],
    queryFn: () => listDrafts({ collection_id: collectionId || null, limit: 20 }),
  });
  const draftDetailQuery = useQuery({
    queryKey: ["drafts", selectedDraftId],
    queryFn: () => getDraft(selectedDraftId),
    enabled: Boolean(selectedDraftId),
  });
  const versionsQuery = useQuery({
    queryKey: ["drafts", selectedDraftId, "versions"],
    queryFn: () => listDraftVersions(selectedDraftId),
    enabled: Boolean(selectedDraftId),
  });
  const documentsQuery = useQuery({
    queryKey: ["documents", "drafts", collectionId, topicName],
    queryFn: () => listDocuments({ limit: 20, status: "READY", collection_id: collectionId || null, tag: topicName || null }),
  });
  const outlineMutation = useMutation({
    mutationFn: generateDraftOutline,
    onSuccess: (outline) => setOutlineSections(outline.sections),
  });
  const draftMutation = useMutation({
    mutationFn: generateDraft,
    onSuccess: (draft) => {
      setSelectedDraftId(draft.draft_id);
      void queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
  const restoreMutation = useMutation({
    mutationFn: ({ draftId, versionId }: { draftId: string; versionId: string }) => restoreDraftVersion(draftId, versionId),
    onSuccess: (draft) => {
      draftMutation.reset();
      setSelectedDraftId(draft.id);
      void queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") =>
      exportMarkdown({
        title: "Cortex draft",
        markdown: activeDraft?.markdown ?? "",
        format,
      }),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const notionMutation = useMutation({
    mutationFn: () =>
      exportNotion({
        title: "Cortex draft",
        markdown: activeDraft?.markdown ?? "",
      }),
  });

  const activeTemplate = useMemo(
    () => templatesQuery.data?.items.find((template) => template.id === templateId) ?? templatesQuery.data?.items[0],
    [templateId, templatesQuery.data?.items],
  );

  useEffect(() => {
    if (!activeTemplate || outlineSections.length) return;
    setOutlineSections(activeTemplate.outline);
  }, [activeTemplate, outlineSections.length]);

  const activeDraft = draftMutation.data ?? draftDetailQuery.data ?? null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const request = payloadFromState();
    if (!request) return;
    draftMutation.mutate(request);
  }

  function payloadFromState(): DraftGenerateRequest | null {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return null;
    const normalizedScope = selectedDocumentIds.length ? "documents" : scopeType;
    return {
      prompt: trimmedPrompt,
      draft_id: selectedDraftId || null,
      template_id: templateId,
      scope_type: normalizedScope,
      collection_id: collectionId || null,
      document_ids: selectedDocumentIds.length ? selectedDocumentIds : null,
      topic: topicName || null,
      knowledge_gap_id: searchParams.get("gap") || null,
      outline: outlineSections.length ? outlineSections : null,
      tag_names: topicName ? [topicName] : null,
      limit: 8,
    };
  }

  function generateOutline() {
    const request = payloadFromState();
    if (!request) return;
    outlineMutation.mutate(request);
  }

  function toggleDocument(documentId: string) {
    setSelectedDocumentIds((items) => (
      items.includes(documentId) ? items.filter((id) => id !== documentId) : [...items, documentId]
    ));
  }

  function updateOutlineSection(index: number, value: string) {
    setOutlineSections((items) => items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function addOutlineSection() {
    setOutlineSections((items) => [...items, "New section"]);
  }

  function removeOutlineSection(index: number) {
    setOutlineSections((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function restoreHistory(item: DraftListItem) {
    draftMutation.reset();
    setSelectedDraftId(item.id);
    setPrompt(item.prompt);
    setTemplateId(item.template_id);
    setScopeType(item.scope_type);
    setOutlineSections([]);
  }

  function restoreVersion(versionId: string) {
    if (!selectedDraftId) return;
    restoreMutation.mutate({ draftId: selectedDraftId, versionId });
  }

  return {
    prompt,
    setPrompt,
    collectionId,
    setCollectionId,
    topicName,
    setTopicName,
    scopeType,
    setScopeType,
    templateId,
    setTemplateId,
    selectedDocumentIds,
    outlineSections,
    collectionsQuery,
    topicsQuery,
    templatesQuery,
    draftsQuery,
    draftDetailQuery,
    versionsQuery,
    documentsQuery,
    outlineMutation,
    draftMutation,
    restoreMutation,
    exportMutation,
    notionMutation,
    notionErrorText: notionMutation.error ? errorMessage(notionMutation.error) : null,
    activeDraft,
    draftSources: activeDraft?.sources ?? [],
    activeTemplate,
    history: draftsQuery.data?.items ?? [],
    versions: versionsQuery.data?.items ?? [],
    generateOutline,
    toggleDocument,
    updateOutlineSection,
    addOutlineSection,
    removeOutlineSection,
    restoreHistory,
    restoreVersion,
    submit,
  };
}
