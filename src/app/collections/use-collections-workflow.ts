"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";

import { createCollection, createCollectionShare, deleteCollection, listCollections, revokeCollectionShare, updateCollection } from "@/lib/api";
import type { CollectionShare } from "@/lib/types";

export const COLLECTION_TEMPLATES = [
  { name: "Programming", description: "Code notes, API docs, patterns, and engineering references." },
  { name: "Research", description: "Papers, articles, citations, and synthesis material." },
  { name: "Projects", description: "Project plans, decisions, implementation notes, and specs." },
  { name: "LeetCode", description: "Problem notes, patterns, constraints, and solved examples." },
];

export function useCollectionsWorkflow() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [renamingCollection, setRenamingCollection] = useState<{ id: string; name: string } | null>(null);
  const [shares, setShares] = useState<Record<string, CollectionShare>>({});
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const collections = collectionsQuery.data?.items ?? [];
  const recentlyUpdated = useMemo(() => collections.filter((collection) => collection.updated_at).length, [collections]);

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: async () => {
      setName("");
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, nextName }: { id: string; nextName: string }) => updateCollection(id, { name: nextName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
  const shareMutation = useMutation({
    mutationFn: createCollectionShare,
    onSuccess: (share) => setShares((current) => ({ ...current, [share.collection_id]: share })),
  });
  const revokeShareMutation = useMutation({
    mutationFn: revokeCollectionShare,
    onSuccess: (_result, collectionId) => {
      setShares((current) => {
        const next = { ...current };
        delete next[collectionId];
        return next;
      });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    createSelectedCollection();
  }

  function createSelectedCollection() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createMutation.mutate({ name: trimmed, description: description.trim() || null });
  }

  function applyTemplate(template: (typeof COLLECTION_TEMPLATES)[number]) {
    setName(template.name);
    setDescription(template.description);
  }

  function saveRename() {
    if (!renamingCollection) return;
    const nextName = renamingCollection.name.trim();
    if (!nextName) return;
    updateMutation.mutate({ id: renamingCollection.id, nextName }, { onSuccess: () => setRenamingCollection(null) });
  }

  return {
    name,
    setName,
    description,
    setDescription,
    renamingCollection,
    setRenamingCollection,
    shares,
    collections,
    collectionsQuery,
    recentlyUpdated,
    createMutation,
    updateMutation,
    deleteMutation,
    shareMutation,
    revokeShareMutation,
    submit,
    createSelectedCollection,
    applyTemplate,
    saveRename,
  };
}
