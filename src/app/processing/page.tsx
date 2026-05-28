"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FileText, RefreshCw, ServerCog, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { getDocumentStatus, listDocuments, listRepoSyncs, reprocessDocument, retryDocument, runRepoSync } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { buildJobs, retryJob } from "./_components/processing-job-helpers";
import { JobCard } from "./_components/processing-job-card";
import { LinkButton } from "./_components/processing-link-button";
import { ProcessingJobDetail } from "./_components/processing-job-detail";
import { ErrorBanner } from "./_components/error-banner";
import { trackedStatuses } from "./_components/processing-types";


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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              description="Documents process automatically after ingestion. Queued, processing, and failed work will appear here when Conserium is busy."
              action={<LinkButton href="/ingest">Add source</LinkButton>}
            />
          )}
        </SectionPanel>

        <ProcessingJobDetail
          selectedJob={selectedJob}
          retryDocument={retryMutation.mutate}
          reprocessDocument={reprocessMutation.mutate}
          retryRepoSync={repoRetryMutation.mutate}
          retryDocumentPending={retryMutation.isPending}
          reprocessPending={reprocessMutation.isPending}
          retryRepoPending={repoRetryMutation.isPending}
        />
      </div>
    </PageShell>
  );
}
