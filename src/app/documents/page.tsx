"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bulkDeleteDocuments, bulkReprocessDocuments, deleteDocument, listCollections, listDocuments } from "@/lib/api";
import type { DocumentStatus, DocumentType } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const typeOptions: Array<DocumentType | "ALL"> = ["ALL", "TEXT", "URL", "YOUTUBE", "PDF", "IMAGE", "MARKDOWN"];
const statusOptions: Array<DocumentStatus | "ALL"> = ["ALL", "PENDING", "QUEUED", "PROCESSING", "READY", "FAILED"];

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<DocumentType | "ALL">("ALL");
  const [status, setStatus] = useState<DocumentStatus | "ALL">("ALL");
  const [collectionId, setCollectionId] = useState<string | "ALL">("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const documentsQuery = useQuery({
    queryKey: ["documents", collectionId, status],
    queryFn: () =>
      listDocuments({
        limit: 100,
        collection_id: collectionId === "ALL" ? null : collectionId,
        status: status === "ALL" ? null : status,
      }),
  });
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

  const documents = useMemo(() => {
    return (documentsQuery.data?.items ?? []).filter((document) => {
      if (type !== "ALL" && document.type !== type) return false;
      if (search && !document.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [documentsQuery.data?.items, search, type]);

  function toggleSelected(documentId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-normal tracking-normal">Library</h1>
          <p className="font-jetbrains mt-2 text-xs text-neutral-500">Documents, ingestion state, enrichment, and duplicate markers.</p>
        </div>
        <Link href="/ingest">
          <Button>Add source</Button>
        </Link>
      </header>

      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_180px_220px]">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles" className="font-jetbrains" />
          <select
            className="h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40"
            value={type}
            onChange={(event) => setType(event.target.value as DocumentType | "ALL")}
          >
            {typeOptions.map((option) => (
              <option key={option} className="bg-black text-neutral-200">
                {option}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40"
            value={status}
            onChange={(event) => setStatus(event.target.value as DocumentStatus | "ALL")}
          >
            {statusOptions.map((option) => (
              <option key={option} className="bg-black text-neutral-200">
                {option}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40"
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value as string | "ALL")}
          >
            <option value="ALL" className="bg-black text-neutral-200">
              All collections
            </option>
            {collectionsQuery.data?.items.map((collection) => (
              <option key={collection.id} value={collection.id} className="bg-black text-neutral-200">
                {collection.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{documents.length} documents</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!selectedIds.size || bulkReprocessMutation.isPending}
              onClick={() => bulkReprocessMutation.mutate([...selectedIds])}
            >
              <RotateCcw className="h-4 w-4" />
              Reprocess
            </Button>
            <Button
              variant="danger"
              disabled={!selectedIds.size || bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate([...selectedIds])}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-white/10">
            {documents.map((document) => (
              <div key={document.id} className="grid gap-3 py-4 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.has(document.id)}
                  onChange={() => toggleSelected(document.id)}
                  className="h-4 w-4 accent-white"
                />
                <Link href={`/documents/${document.id}`} className="min-w-0">
                  <div className="truncate font-normal text-neutral-100">{document.title}</div>
                  <div className="font-jetbrains mt-1 text-sm text-neutral-500">
                    {document.type} · {document.language ?? "unknown language"} · {formatDateTime(document.created_at)}
                  </div>
                  {document.is_duplicate ? (
                    <div className="mt-1 text-xs text-red-400">Possible duplicate of {document.duplicate_of_id}</div>
                  ) : null}
                </Link>
                <div className="font-jetbrains text-sm text-neutral-500">{document.word_count ?? "—"} words</div>
                <StatusPill status={document.status} />
                <Button variant="danger" size="icon" onClick={() => deleteMutation.mutate(document.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {!documents.length ? <div className="py-10 text-center text-sm text-neutral-500">No documents match.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
