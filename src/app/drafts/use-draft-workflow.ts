"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardList, FileText, GitCompareArrows } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { exportMarkdown, exportNotion, generateDraft, listCollections, listTopics } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { downloadBlob } from "@/lib/download";

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
  const [prompt, setPrompt] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [topicName, setTopicName] = useState("");
  const collectionsQuery = useQuery({ queryKey: ["collections", "drafts"], queryFn: () => listCollections({ limit: 100 }) });
  const topicsQuery = useQuery({ queryKey: ["topics", "drafts"], queryFn: () => listTopics({ limit: 100 }) });
  const draftMutation = useMutation({ mutationFn: generateDraft });
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") =>
      exportMarkdown({
        title: "Cortex draft",
        markdown: draftMutation.data?.markdown ?? "",
        format,
      }),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const notionMutation = useMutation({
    mutationFn: () =>
      exportNotion({
        title: "Cortex draft",
        markdown: draftMutation.data?.markdown ?? "",
      }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    draftMutation.mutate({
      prompt: trimmedPrompt,
      collection_id: collectionId || null,
      tag_names: topicName ? [topicName] : null,
      limit: 8,
    });
  }

  return {
    prompt,
    setPrompt,
    collectionId,
    setCollectionId,
    topicName,
    setTopicName,
    collectionsQuery,
    topicsQuery,
    draftMutation,
    exportMutation,
    notionMutation,
    notionErrorText: notionMutation.error ? errorMessage(notionMutation.error) : null,
    draftSources: draftMutation.data?.sources ?? [],
    submit,
  };
}
