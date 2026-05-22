"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, FileArchive, FileText, RefreshCw, RotateCcw, ServerCog, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ProcessingTimeline } from "@/components/documents/processing-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDocumentStatus, listDocuments, listRepoSyncs, reprocessDocument, retryDocument, runRepoSync } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { DocumentListItem, DocumentStatusResponse, RepoSync } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

type JobKind = "document" | "repo-sync" | "export";
type JobState = "active" | "failed" | "idle";

type ProcessingJob = {
  id: string;
  kind: JobKind;
  title: string;
  subtitle: string;
  status: string;
  state: JobState;
  reason: string | null;
  updatedAt: string | null;
  document?: DocumentListItem;
  repoSync?: RepoSync;
  statusDetail?: DocumentStatusResponse;
};

const trackedStatuses = ["PENDING", "QUEUED", "PROCESSING", "FAILED"] as const;

export default function ProcessingPage() {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const documentsQuery = useQuery({
    queryKey: ["documents", "processing-center"],
    queryFn: () => listDocuments({ limit: 100 }),
    refetchInterval: 5000,
  });
  const repoSyncsQuery = useQuery({
    queryKey: ["repo-syncs", "processing-center"],
    queryFn: listRepoSyncs,
    refetchInterval: 5000,
  });
  const trackedDocuments = useMemo(
    () => (documentsQuery.data?.items ?? []).filter((document) => trackedStatuses.includes(document.status as (typeof trackedStatuses)[number])),
    [documentsQuery.data?.items],
  );
  const statusQueries = useQueries({
    queries: trackedDocuments.map((document) => ({
      queryKey: ["document-status", document.id, "processing-center"],
      queryFn: () => getDocumentStatus(document.id),
      refetchInterval: document.status === "READY" || document.status === "FAILED" ? false : 2500,
    })),
  });
  const statusByDocumentId = new Map(
    trackedDocuments.map((document, index) => [document.id, statusQueries[index]?.data]),
  );
  const jobs = useMemo(
    () => buildJobs({
      documents: trackedDocuments,
      repoSyncs: repoSyncsQuery.data?.items ?? [],
      statusByDocumentId,
    }),
    [repoSyncsQuery.data?.items, statusByDocumentId, trackedDocuments],
  );
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0] ?? null;
  const retryMutation = useMutation({
    mutationFn: retryDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["document-status"] });
    },
  });
  const reprocessMutation = useMutation({
    mutationFn: reprocessDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["document-status"] });
    },
  });
  const repoRetryMutation = useMutation({
    mutationFn: (id: string) => runRepoSync(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["repo-syncs"] });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const activeCount = jobs.filter((job) => job.state === "active").length;
  const failedCount = jobs.filter((job) => job.state === "failed").length;
  const documentCount = jobs.filter((job) => job.kind === "document").length;
  const repoCount = jobs.filter((job) => job.kind === "repo-sync").length;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="System"
        title="Processing center"
        description="Track ingestion, repository sync, extraction, embeddings, enrichment, and export availability from one place."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              void documentsQuery.refetch();
              void repoSyncsQuery.refetch();
            }}
            disabled={documentsQuery.isFetching || repoSyncsQuery.isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Active jobs" value={activeCount} detail="Queued or processing" icon={<ServerCog className="h-4 w-4" />} />
        <MetricCard label="Failed jobs" value={failedCount} detail="Retry available" icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard label="Documents" value={documentCount} detail="Ingest/extract/embed/enrich" icon={<FileText className="h-4 w-4" />} />
        <MetricCard label="Repo sync" value={repoCount} detail="GitHub sync attempts" icon={<UploadCloud className="h-4 w-4" />} />
      </div>

      {documentsQuery.error ? <ErrorBanner message={errorMessage(documentsQuery.error)} /> : null}
      {repoSyncsQuery.error ? <ErrorBanner message={errorMessage(repoSyncsQuery.error)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <SectionPanel title="Jobs" description="Active and failed work across ingestion and sync pipelines.">
          {jobs.length ? (
            <div className="grid gap-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedJob?.id === job.id}
                  onSelect={() => setSelectedJobId(job.id)}
                  onRetry={() => retryJob(job, retryMutation.mutate, repoRetryMutation.mutate)}
                  retryPending={retryMutation.isPending || repoRetryMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ServerCog className="h-5 w-5" />}
              title="No active or failed jobs"
              description="Queued, processing, and failed work will appear here as ingestion and sync jobs run."
              action={<LinkButton href="/ingest">Add source</LinkButton>}
            />
          )}
        </SectionPanel>

        <SectionPanel
          title="Timeline"
          description={selectedJob ? selectedJob.title : "Select a job to inspect stages and errors."}
          actions={selectedJob ? <StatusBadge status={selectedJob.status} /> : null}
        >
          {selectedJob ? (
            <div className="grid gap-4">
              <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                <div className="font-jetbrains text-[11px] uppercase tracking-[0.18em] text-neutral-500">Reason</div>
                <div className={selectedJob.reason ? "mt-2 text-sm leading-6 text-red-200" : "mt-2 text-sm leading-6 text-neutral-400"}>
                  {selectedJob.reason ?? reasonForStatus(selectedJob.status, selectedJob.kind)}
                </div>
              </div>

              {selectedJob.kind === "document" ? (
                <>
                  <ProcessingTimeline status={selectedJob.statusDetail} />
                  <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    {selectedJob.document?.status === "FAILED" ? (
                      <Button onClick={() => retryMutation.mutate(selectedJob.document!.id)} disabled={retryMutation.isPending}>
                        <RotateCcw className="h-4 w-4" />
                        Retry failed job
                      </Button>
                    ) : null}
                    {selectedJob.document ? (
                      <>
                        <Button variant="secondary" onClick={() => reprocessMutation.mutate(selectedJob.document!.id)} disabled={reprocessMutation.isPending}>
                          <RefreshCw className="h-4 w-4" />
                          Reprocess
                        </Button>
                        <LinkButton href={`/documents/${selectedJob.document.id}`} variant="secondary">
                          Open document
                        </LinkButton>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}

              {selectedJob.kind === "repo-sync" && selectedJob.repoSync ? (
                <div className="grid gap-3">
                  <StageRow label="Repository" value={`${selectedJob.repoSync.owner}/${selectedJob.repoSync.repo}`} />
                  <StageRow label="Branch" value={selectedJob.repoSync.branch} />
                  <StageRow label="Last synced" value={formatDateTime(selectedJob.repoSync.last_synced_at)} />
                  <Button onClick={() => repoRetryMutation.mutate(selectedJob.repoSync!.id)} disabled={repoRetryMutation.isPending}>
                    <RefreshCw className="h-4 w-4" />
                    Retry repo sync
                  </Button>
                </div>
              ) : null}

              {selectedJob.kind === "export" ? (
                <div className="text-sm leading-6 text-neutral-400">
                  Exports currently run synchronously. Failed Notion exports surface on the export action that started them.
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyState icon={<FileArchive className="h-5 w-5" />} title="No job selected" description="Active or failed jobs will expose their retry actions and processing timeline here." />
          )}
        </SectionPanel>
      </div>
    </PageShell>
  );
}

function buildJobs({
  documents,
  repoSyncs,
  statusByDocumentId,
}: {
  documents: DocumentListItem[];
  repoSyncs: RepoSync[];
  statusByDocumentId: Map<string, DocumentStatusResponse | undefined>;
}): ProcessingJob[] {
  const documentJobs = documents.map((document) => {
    const detail = statusByDocumentId.get(document.id);
    return {
      id: `document:${document.id}`,
      kind: "document" as const,
      title: document.title,
      subtitle: documentJobSubtitle(document.status),
      status: detail?.status ?? document.status,
      state: document.status === "FAILED" ? "failed" as const : "active" as const,
      reason: detail?.failure_reason ?? null,
      updatedAt: document.updated_at ?? document.created_at,
      document,
      statusDetail: detail,
    };
  });
  const repoJobs = repoSyncs
    .filter((sync) => ["running", "queueing", "failed"].includes(sync.status) || sync.last_error)
    .map((sync) => ({
      id: `repo-sync:${sync.id}`,
      kind: "repo-sync" as const,
      title: `${sync.owner}/${sync.repo}`,
      subtitle: `GitHub ${sync.branch}`,
      status: sync.status,
      state: sync.status === "failed" || sync.last_error ? "failed" as const : "active" as const,
      reason: sync.last_error,
      updatedAt: sync.last_synced_at ?? sync.created_at,
      repoSync: sync,
    }));
  return [...documentJobs, ...repoJobs, exportPlaceholder()].sort((left, right) => stateRank(left.state) - stateRank(right.state));
}

function exportPlaceholder(): ProcessingJob {
  return {
    id: "exports:sync",
    kind: "export",
    title: "Exports",
    subtitle: "Markdown, PDF, Notion",
    status: "idle",
    state: "idle",
    reason: null,
    updatedAt: null,
  };
}

function JobCard({
  job,
  selected,
  onSelect,
  onRetry,
  retryPending,
}: {
  job: ProcessingJob;
  selected: boolean;
  onSelect: () => void;
  onRetry: () => void;
  retryPending: boolean;
}) {
  const Icon = jobIcon(job.kind);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select ${job.title}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "cursor-pointer",
        "grid gap-3 rounded-lg border p-4 text-left transition md:grid-cols-[1fr_auto]",
        selected ? "border-white/30 bg-white/[0.065]" : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.055]",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <Icon className="h-4 w-4 text-neutral-400" />
          <h2 className="truncate text-base font-medium text-white">{job.title}</h2>
          <StatusBadge status={job.status} />
        </div>
        <div className="font-jetbrains mt-2 text-xs text-neutral-500">{job.subtitle} / {job.updatedAt ? formatDateTime(job.updatedAt) : "no active run"}</div>
        {job.reason ? <div className="mt-3 line-clamp-2 text-sm leading-6 text-red-200">{job.reason}</div> : null}
      </div>
      <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
        {job.state === "failed" ? (
          <Button
            type="button"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onRetry();
            }}
            disabled={retryPending}
          >
            Retry
          </Button>
        ) : null}
        <ArrowRight className="h-4 w-4 text-neutral-500" />
      </div>
    </div>
  );
}

function retryJob(job: ProcessingJob, retryDocumentJob: (id: string) => void, retryRepoJob: (id: string) => void) {
  if (job.kind === "document" && job.document?.status === "FAILED") {
    retryDocumentJob(job.document.id);
  }
  if (job.kind === "repo-sync" && job.repoSync) {
    retryRepoJob(job.repoSync.id);
  }
}

function documentJobSubtitle(status: string): string {
  if (status === "PENDING" || status === "QUEUED") return "Ingest queue";
  if (status === "PROCESSING") return "Extracting, embedding, or enriching";
  if (status === "FAILED") return "Document processing failed";
  return "Document processing";
}

function reasonForStatus(status: string, kind: JobKind): string {
  if (kind === "export") return "No asynchronous export job is currently tracked.";
  if (status === "PENDING") return "Document is saved and waiting to be queued.";
  if (status === "QUEUED") return "Worker task is queued and waiting for capacity.";
  if (status === "PROCESSING") return "Worker is extracting text, generating embeddings, or enriching metadata.";
  if (status === "running") return "Repository sync is fetching and comparing source files.";
  if (status === "queueing") return "Repository sync created work and is waiting for the outbox drainer.";
  return "No detailed error reason was recorded.";
}

function jobIcon(kind: JobKind) {
  if (kind === "repo-sync") return UploadCloud;
  if (kind === "export") return FileArchive;
  return FileText;
}

function stateRank(state: JobState): number {
  if (state === "failed") return 0;
  if (state === "active") return 1;
  return 2;
}

function StageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
      <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-200">{value}</span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{message}</div>;
}

function LinkButton({ href, variant = "default", children }: { href: string; variant?: "default" | "secondary"; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white/20",
        variant === "default"
          ? "border-white bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-neutral-200"
          : "border-white/10 bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]",
      )}
    >
      {children}
    </Link>
  );
}
