"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { DocumentList } from "@/components/documents/document-list";
import { DocumentsBulkActions } from "@/components/documents/documents-bulk-actions";
import { DocumentsFilterToolbar } from "@/components/documents/documents-filter-toolbar";
import { UndoDeleteToast } from "@/components/documents/undo-delete-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentFilters } from "@/hooks/use-document-filters";
import { useUndoableDocumentDelete } from "@/hooks/use-undoable-document-delete";
import { bulkDeleteDocuments, bulkReprocessDocuments, deleteDocument, listCollections, listDocuments } from "@/lib/api";

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const documentsQuery = useQuery({ queryKey: ["documents"], queryFn: () => listDocuments({ limit: 100 }) });
  const filters = useDocumentFilters(documentsQuery.data?.items ?? []);

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteDocuments,
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const bulkReprocessMutation = useMutation({
    mutationFn: bulkReprocessDocuments,
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const { pendingDelete, scheduleDelete, undoDelete } = useUndoableDocumentDelete({
    onDeleteOne: (documentId) => deleteMutation.mutate(documentId),
    onDeleteMany: (documentIds) => bulkDeleteMutation.mutate(documentIds),
  });

  function toggleSelected(documentId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  }

  function deleteDocumentWithUndo(documentId: string, title: string) {
    scheduleDelete([documentId], `"${title}" will be deleted`);
  }

  function bulkDeleteWithUndo() {
    if (!selectedIds.size) return;
    scheduleDelete([...selectedIds], `${selectedIds.size} selected document${selectedIds.size === 1 ? "" : "s"} will be deleted`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-normal tracking-normal">Library</h1>
          <p className="font-jetbrains mt-2 text-xs text-neutral-500">Documents, ingestion state, enrichment, and duplicate markers.</p>
        </div>
        <Link href="/ingest"><Button>Add source</Button></Link>
      </header>

      <Card>
        <CardContent>
          <DocumentsFilterToolbar
            search={filters.search}
            type={filters.type}
            status={filters.status}
            collectionId={filters.collectionId}
            tag={filters.tag}
            collections={collectionsQuery.data?.items ?? []}
            availableTags={filters.availableTags}
            onSearchChange={filters.setSearch}
            onTypeChange={filters.setType}
            onStatusChange={filters.setStatus}
            onCollectionChange={filters.setCollectionId}
            onTagChange={filters.setTag}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{filters.filteredDocuments.length} documents</CardTitle>
          <DocumentsBulkActions
            count={selectedIds.size}
            reprocessPending={bulkReprocessMutation.isPending}
            deletePending={bulkDeleteMutation.isPending}
            onReprocess={() => bulkReprocessMutation.mutate([...selectedIds])}
            onDelete={bulkDeleteWithUndo}
          />
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={filters.filteredDocuments}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            onDelete={deleteDocumentWithUndo}
          />
        </CardContent>
      </Card>
      {pendingDelete ? <UndoDeleteToast label={pendingDelete.label} onUndo={undoDelete} /> : null}
    </div>
  );
}
