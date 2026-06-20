"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DocumentList } from "@/components/documents/document-list";
import { DocumentsBulkActions } from "@/components/documents/documents-bulk-actions";
import { DocumentsFilterToolbar } from "@/components/documents/documents-filter-toolbar";
import { UndoDeleteToast } from "@/components/documents/undo-delete-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDocumentFilters } from "@/hooks/use-document-filters";
import { useUndoableDocumentDelete } from "@/hooks/use-undoable-document-delete";
import { bulkAddDocumentTags, bulkDeleteDocuments, bulkMoveDocuments, bulkReprocessDocuments, deleteDocument, exportDocument, listCollections, listDocuments, searchDocuments } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { downloadBlob } from "@/lib/download";

const DOCUMENT_PAGE_SIZE = 100;

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCollectionId, setBulkCollectionId] = useState("");
  const [bulkTags, setBulkTags] = useState("");
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const documentsQuery = useInfiniteQuery({
    queryKey: ["documents"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listDocuments({ limit: DOCUMENT_PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.items.length;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
  });
  const documents = documentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const totalDocuments = documentsQuery.data?.pages[0]?.total ?? 0;
  const filters = useDocumentFilters(documents, searchParams.get("tag"));
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 300);
  const semanticSearchEnabled = debouncedSearch.length > 0;
  const searchQuery = useQuery({
    queryKey: ["documents", "search", debouncedSearch, filters.type, filters.status, filters.collectionId, filters.tag],
    queryFn: () => searchDocuments({
      query: debouncedSearch,
      limit: 50,
      type: filters.type === "ALL" ? null : filters.type,
      status: filters.status === "ALL" ? null : filters.status,
      collection_id: filters.collectionId === "ALL" ? null : filters.collectionId,
      tag: filters.tag === "ALL" ? null : filters.tag,
    }),
    enabled: semanticSearchEnabled,
  });
  const semanticDocuments = searchQuery.data?.items.map((item) => item.document) ?? [];
  const searchSnippets = useMemo(() => {
    return Object.fromEntries((searchQuery.data?.items ?? []).map((item) => [item.document.id, item.snippet]));
  }, [searchQuery.data?.items]);
  const displayedDocuments = semanticSearchEnabled ? semanticDocuments : filters.filteredDocuments;
  const activeError = semanticSearchEnabled ? searchQuery.error : documentsQuery.error;

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
  const bulkMoveMutation = useMutation({
    mutationFn: () => bulkMoveDocuments([...selectedIds], bulkCollectionId || null),
    onSuccess: async () => {
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const bulkTagMutation = useMutation({
    mutationFn: () => bulkAddDocumentTags([...selectedIds], parseTags(bulkTags)),
    onSuccess: async () => {
      setBulkTags("");
      setSelectedIds(new Set());
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const bulkExportMutation = useMutation({
    mutationFn: () => exportSelectedMarkdown(displayedDocuments.filter((document) => selectedIds.has(document.id))),
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
          <CardTitle>
            {displayedDocuments.length} {semanticSearchEnabled ? "semantic results" : "documents"}
            {!semanticSearchEnabled && documentsQuery.data ? (
              <span className="font-jetbrains ml-2 text-xs font-light text-neutral-500">of {totalDocuments} loaded</span>
            ) : null}
          </CardTitle>
          <DocumentsBulkActions
            count={selectedIds.size}
            reprocessPending={bulkReprocessMutation.isPending}
            deletePending={bulkDeleteMutation.isPending}
            movePending={bulkMoveMutation.isPending}
            tagPending={bulkTagMutation.isPending}
            exportPending={bulkExportMutation.isPending}
            collections={collectionsQuery.data?.items ?? []}
            selectedCollectionId={bulkCollectionId}
            tagInput={bulkTags}
            onCollectionChange={setBulkCollectionId}
            onTagInputChange={setBulkTags}
            onMove={() => bulkMoveMutation.mutate()}
            onAddTags={() => bulkTagMutation.mutate()}
            onExport={() => bulkExportMutation.mutate()}
            onReprocess={() => bulkReprocessMutation.mutate([...selectedIds])}
            onDelete={bulkDeleteWithUndo}
          />
        </CardHeader>
        <CardContent>
          {activeError ? (
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
              {errorMessage(activeError)}
            </div>
          ) : (
            <DocumentList
              documents={displayedDocuments}
              selectedIds={selectedIds}
              searchSnippets={semanticSearchEnabled ? searchSnippets : undefined}
              onToggleSelected={toggleSelected}
              onDelete={deleteDocumentWithUndo}
            />
          )}
          {!semanticSearchEnabled && !documentsQuery.error && documentsQuery.hasNextPage ? (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onClick={() => void documentsQuery.fetchNextPage()} disabled={documentsQuery.isFetchingNextPage}>
                {documentsQuery.isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {pendingDelete ? <UndoDeleteToast label={pendingDelete.label} onUndo={undoDelete} /> : null}
    </div>
  );
}

function parseTags(value: string): string[] {
  return [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

async function exportSelectedMarkdown(documents: Array<{ id: string; title: string }>) {
  const parts = await Promise.all(
    documents.map(async (document) => {
      const { blob } = await exportDocument(document.id, "markdown");
      return `# ${document.title}\n\n${await blob.text()}`;
    }),
  );
  const blob = new Blob([parts.join("\n\n---\n\n")], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `conserium-selected-${new Date().toISOString().slice(0, 10)}.md`);
}
