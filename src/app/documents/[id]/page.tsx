"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { StatusPill } from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  deleteDocument,
  getDocument,
  getDocumentChunk,
  getDocumentStatus,
  listCollections,
  moveDocument,
  renameDocument,
  reprocessDocument,
  retryDocument,
} from "@/lib/api";
import type { DocumentProcessingStep, DocumentStatusResponse } from "@/lib/types";
import { cn, compactId, formatDateTime } from "@/lib/utils";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
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
    <div className="mx-auto grid max-w-6xl gap-10 p-4 md:grid-cols-[1fr_380px] md:p-10">
      <section className="space-y-10">
        <div className="flex flex-wrap gap-2">
          <Link href="/documents">
            <Button className="h-9 px-4 text-sm">Back to library</Button>
          </Link>
          {visibleStatus === "FAILED" ? (
            <Button variant="secondary" onClick={() => retryMutation.mutate(document.id)} disabled={retryMutation.isPending}>
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => reprocessMutation.mutate(document.id)} disabled={reprocessMutation.isPending}>
            <RotateCcw className="h-4 w-4" />
            Reprocess
          </Button>
          <Button variant="danger" onClick={() => deleteMutation.mutate(document.id)} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const title = window.prompt("Document title", document.title);
              if (title?.trim()) renameMutation.mutate(title.trim());
            }}
          >
            <Pencil className="h-4 w-4" />
            Rename
          </Button>
        </div>

        <header className="space-y-5">
          <div className="font-jetbrains flex flex-wrap gap-2">
            <StatusPill status={visibleStatus} />
            <Badge>{document.type}</Badge>
            {document.language ? <Badge>{document.language}</Badge> : null}
          </div>
          <div>
            <h1 className="text-3xl font-normal tracking-normal text-white">{document.title}</h1>
            <p className="font-jetbrains mt-4 text-sm text-neutral-500">
              {compactId(document.id)} · {formatDateTime(document.created_at)}
            </p>
          </div>
        </header>

        {status?.failure_reason ? (
          <Card className="border-red-500/30 bg-red-500/[0.04]">
            <CardHeader>
              <CardTitle>Failure reason</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-red-200">{status.failure_reason}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <HighlightedContent content={document.raw_content} start={chunkQuery.data?.start_char} end={chunkQuery.data?.end_char} />
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <StatusPill status={visibleStatus} />
                <span className="font-jetbrains text-xs text-neutral-500">{status?.progress ?? 0}%</span>
              </div>
              <Progress value={status?.progress ?? 0} />
              <div className="text-neutral-400">{status?.message ?? "No worker status yet."}</div>
            </div>
            <ProcessingTimeline status={status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="word count" value={String(document.word_count ?? "-")} />
            <Row label="source" value={document.source_url ?? document.file_path ?? "-"} />
            <div className="grid grid-cols-[100px_1fr] gap-5 border-b border-white/10 pb-3">
              <div className="font-jetbrains text-neutral-500">collection</div>
              <select
                className="h-9 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none"
                value={document.collection_id ?? ""}
                onChange={(event) => moveMutation.mutate(event.target.value || null)}
              >
                <option value="" className="bg-black text-neutral-200">
                  None
                </option>
                {collectionsQuery.data?.items.map((collection) => (
                  <option key={collection.id} value={collection.id} className="bg-black text-neutral-200">
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
            <Row label="duplicate" value={document.is_duplicate ? `yes · ${document.duplicate_of_id}` : "no"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrichment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TagBlock title="Tags" values={document.tags} />
            <SuggestedQuestions values={document.suggested_questions} />
            <JsonBlock title="Entities" value={document.entities} />
            <JsonBlock title="Categories" value={document.categories} />
            <JsonBlock title="Visual metadata" value={document.visual_metadata} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function HighlightedContent({ content, start, end }: { content: string | null; start: number | null | undefined; end: number | null | undefined }) {
  if (!content) {
    return <pre className="whitespace-pre-wrap text-sm leading-7 text-white">No raw content returned.</pre>;
  }
  if (start === null || start === undefined || end === null || end === undefined || start < 0 || end <= start) {
    return <pre className="whitespace-pre-wrap text-sm leading-7 text-white">{content}</pre>;
  }
  return (
    <pre className="whitespace-pre-wrap text-sm leading-7 text-white">
      {content.slice(0, start)}
      <mark className="rounded bg-yellow-300 px-1 text-black">{content.slice(start, end)}</mark>
      {content.slice(end)}
    </pre>
  );
}

function hasVisibleEnrichment(document: NonNullable<Awaited<ReturnType<typeof getDocument>>>) {
  return Boolean(
    document.tags.length ||
      document.entities?.length ||
      document.categories?.length ||
      document.visual_metadata ||
      document.is_duplicate,
  );
}

function ProcessingTimeline({ status }: { status: DocumentStatusResponse | undefined }) {
  const timeline = status?.timeline ?? [];
  if (!timeline.length) {
    return <div className="font-jetbrains text-xs text-neutral-500">Timeline unavailable.</div>;
  }
  return (
    <div className="space-y-3">
      {timeline.map((step) => (
        <TimelineStep key={step.key} step={step} />
      ))}
    </div>
  );
}

function TimelineStep({ step }: { step: DocumentProcessingStep }) {
  return (
    <div className="grid grid-cols-[18px_1fr] gap-3">
      <div className={cn("mt-1 h-3 w-3 rounded-full border", markerStyle(step.state))} />
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-neutral-100">{step.label}</div>
          <div className="font-jetbrains text-xs text-neutral-500">{step.state}</div>
        </div>
        {step.message ? <div className="mt-1 text-xs leading-5 text-neutral-500">{step.message}</div> : null}
      </div>
    </div>
  );
}

function markerStyle(state: string) {
  if (state === "complete") return "border-emerald-400 bg-emerald-400";
  if (state === "current") return "border-orange-400 bg-orange-400";
  if (state === "failed") return "border-red-400 bg-red-400";
  return "border-white/20 bg-transparent";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-5 border-b border-white/10 pb-3">
      <div className="font-jetbrains text-neutral-500">{label}</div>
      <div className="break-words text-neutral-100">{value}</div>
    </div>
  );
}

function SuggestedQuestions({ values }: { values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <div className="font-jetbrains mb-2 text-xs text-neutral-500">Suggested questions</div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="font-jetbrains rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function TagBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <div className="mb-3 text-sm font-normal text-neutral-100">{title}</div>
      <div className="font-jetbrains flex flex-wrap gap-2">
        {values.length ? values.map((value) => <Badge key={value}>{value}</Badge>) : <span className="text-sm text-neutral-500">None</span>}
      </div>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <div className="mb-3 text-sm font-normal text-neutral-100">{title}</div>
      <pre className="font-jetbrains max-h-48 overflow-auto rounded-md border border-white/10 bg-black p-3 text-xs leading-5 text-neutral-300">
        {value ? JSON.stringify(value, null, 2) : "None"}
      </pre>
    </div>
  );
}
