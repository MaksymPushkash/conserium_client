"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { DocumentActions } from "@/components/documents/document-actions";
import { DocumentActivityIndicator } from "@/components/documents/document-activity-indicator";
import { DialogPanel } from "@/components/documents/document-dialog-panel";
import { DocumentEnrichmentCard } from "@/components/documents/document-enrichment-card";
import { DocumentMetadataCard } from "@/components/documents/document-metadata-card";
import { DocumentProcessingCard } from "@/components/documents/document-processing-card";
import { HighlightedContent } from "@/components/documents/highlighted-content";
import { RelatedDocumentsCard } from "@/components/documents/related-documents-card";
import { StatusPill } from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteDocument,
  exportDocument,
  getDocument,
  getDocumentChunk,
  getDocumentConnections,
  getDocumentQuestionHistory,
  getDocumentStatus,
  listCollections,
  moveDocument,
  renameDocument,
  reprocessDocument,
  retryDocument,
} from "@/lib/api";
import { compactId, formatDateTime } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const focusedChunkId = searchParams.get("chunk");
  const documentQuery = useQuery({
    queryKey: ["document", params.id],
    queryFn: () => getDocument(params.id),
    refetchInterval: (query) => {
      const document = query.state.data;
      if (!document || document.status === "FAILED") return false;
      return hasVisibleEnrichment(document) ? false : 5000;
    },
  });
  const statusQuery = useQuery({
    queryKey: ["document-status", params.id],
    queryFn: () => getDocumentStatus(params.id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "READY" || status === "FAILED" ? false : 2000;
    },
  });
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const questionHistoryQuery = useQuery({
    queryKey: ["document", params.id, "questions"],
    queryFn: () => getDocumentQuestionHistory(params.id, 5),
  });
  const connectionsQuery = useQuery({
    queryKey: ["document", params.id, "connections"],
    queryFn: () => getDocumentConnections(params.id, 5),
  });
  const chunkQuery = useQuery({
    queryKey: ["document", params.id, "chunk", focusedChunkId],
    queryFn: () => getDocumentChunk(params.id, focusedChunkId as string),
    enabled: Boolean(focusedChunkId),
  });
  const renameMutation = useMutation({
    mutationFn: (title: string) => renameDocument(params.id, { title }),
    onSuccess: (document) => queryClient.invalidateQueries({ queryKey: ["document", document.id] }),
  });
  const moveMutation = useMutation({
    mutationFn: (collectionId: string | null) => moveDocument(params.id, { collection_id: collectionId }),
    onSuccess: (document) => queryClient.invalidateQueries({ queryKey: ["document", document.id] }),
  });
  const retryMutation = useMutation({
    mutationFn: retryDocument,
    onSuccess: async (document) => {
      await queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      await queryClient.invalidateQueries({ queryKey: ["document-status", document.id] });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const reprocessMutation = useMutation({
    mutationFn: reprocessDocument,
    onSuccess: async (document) => {
      await queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      await queryClient.invalidateQueries({ queryKey: ["document-status", document.id] });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.push("/documents");
    },
  });
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") => exportDocument(params.id, format),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const document = documentQuery.data;
  const status = statusQuery.data;

  if (documentQuery.isLoading) {
    return <div className="p-8 text-sm text-neutral-500">Loading document...</div>;
  }

  if (!document) {
    return <div className="p-8 text-sm text-neutral-500">Document not found.</div>;
  }

  const visibleStatus = status?.status ?? document.status;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 p-4 md:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] md:p-10">
      <section className="min-w-0 space-y-10">
        <DocumentActions
          documentId={document.id}
          failed={visibleStatus === "FAILED"}
          retryPending={retryMutation.isPending}
          reprocessPending={reprocessMutation.isPending}
          deletePending={deleteMutation.isPending}
          exportPending={exportMutation.isPending}
          onRetry={(documentId) => retryMutation.mutate(documentId)}
          onReprocess={(documentId) => reprocessMutation.mutate(documentId)}
          onDelete={() => setDeleteOpen(true)}
          onRename={() => {
            setRenameTitle(document.title);
            setRenameOpen(true);
          }}
          onExport={(format) => exportMutation.mutate(format)}
        />

        <header className="space-y-5">
          <div className="font-jetbrains flex flex-wrap gap-2">
            <StatusPill status={visibleStatus} />
            <DocumentActivityIndicator temperature={document.activity_temperature} />
            <Badge>{document.type}</Badge>
            {document.language ? <Badge>{document.language}</Badge> : null}
          </div>
          <div>
            <h1 className="text-3xl font-normal tracking-normal text-white">{document.title}</h1>
            <p className="font-jetbrains mt-4 text-sm text-neutral-500">
              {compactId(document.id)} · {formatDateTime(document.created_at)}
            </p>
          </div>
          {visibleStatus === "READY" ? (
            <Link href={`/chat?document=${document.id}`} className="inline-flex">
              <Button className="font-normal">
                <MessageSquare className="h-4 w-4" />
                Ask about this document
              </Button>
            </Link>
          ) : (
            <Button className="font-normal" disabled>
              <MessageSquare className="h-4 w-4" />
              Ask about this document
            </Button>
          )}
        </header>

        {status?.failure_reason ? (
          <Card className="border-white/10 bg-white/[0.04]">
            <CardHeader>
              <CardTitle>Failure reason</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-neutral-300">{status.failure_reason}</CardContent>
          </Card>
        ) : null}

        {document.summary ? (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-neutral-300">{document.summary}</CardContent>
          </Card>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightedContent content={document.raw_content} start={chunkQuery.data?.start_char} end={chunkQuery.data?.end_char} />
          </CardContent>
        </Card>
      </section>

      <aside className="min-w-0 space-y-6">
        <DocumentProcessingCard status={status} visibleStatus={visibleStatus} />
        <DocumentMetadataCard
          document={document}
          collections={collectionsQuery.data?.items ?? []}
          onMove={(collectionId) => moveMutation.mutate(collectionId)}
        />
        <RelatedDocumentsCard
          currentDocumentId={document.id}
          items={connectionsQuery.data?.items ?? []}
          loading={connectionsQuery.isLoading}
        />
        <Card>
          <CardHeader>
            <CardTitle>Recent Q&A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questionHistoryQuery.data?.items.length ? (
              questionHistoryQuery.data.items.map((item) => (
                <div key={`${item.created_at}-${item.query_text}`} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
                  <div className="text-sm font-medium text-white">{item.query_text}</div>
                  <div className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">{item.answer_text ?? "Answer not saved."}</div>
                  <div className="font-jetbrains mt-2 text-xs text-neutral-500">
                    {item.result_count} sources · {formatDateTime(item.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="font-jetbrains text-xs leading-6 text-neutral-500">No document-scoped answers yet.</div>
            )}
          </CardContent>
        </Card>
        <DocumentEnrichmentCard document={document} />
      </aside>
      {renameOpen ? (
        <DialogPanel title="Rename document" onClose={() => setRenameOpen(false)}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const nextTitle = renameTitle.trim();
              if (!nextTitle) return;
              renameMutation.mutate(nextTitle, { onSuccess: () => setRenameOpen(false) });
            }}
          >
            <input
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={renameMutation.isPending || !renameTitle.trim()}>
                Save
              </Button>
            </div>
          </form>
        </DialogPanel>
      ) : null}
      {deleteOpen ? (
        <DialogPanel title="Delete document" onClose={() => setDeleteOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-neutral-400">Delete "{document.title}" permanently?</p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => deleteMutation.mutate(document.id)} disabled={deleteMutation.isPending}>
                Delete
              </Button>
            </div>
          </div>
        </DialogPanel>
      ) : null}
    </div>
  );
}


function hasVisibleEnrichment(document: NonNullable<Awaited<ReturnType<typeof getDocument>>>) {
  return Boolean(
    document.tags.length ||
      document.entities?.length ||
      document.categories?.length ||
      document.visual_metadata ||
      document.suggested_questions.length ||
      document.summary ||
      document.is_duplicate,
  );
}
