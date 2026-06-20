import type { DocumentListItem, DocumentStatusResponse, RepoSync } from "@/lib/types";

import type { JobKind, JobState, ProcessingJob } from "./processing-types";

export function buildJobs({
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
  return [...documentJobs, ...repoJobs].sort((left, right) => stateRank(left.state) - stateRank(right.state));
}

export function retryJob(job: ProcessingJob, retryDocumentJob: (id: string) => void, retryRepoJob: (id: string) => void) {
  if (job.kind === "document" && job.document?.status === "FAILED") {
    retryDocumentJob(job.document.id);
  }
  if (job.kind === "repo-sync" && job.repoSync) {
    retryRepoJob(job.repoSync.id);
  }
}

export function reasonForStatus(status: string, kind: JobKind): string {
  if (kind === "export") return "No asynchronous export job is currently tracked.";
  if (status === "PENDING") return "Document is saved and waiting to be queued.";
  if (status === "QUEUED") return "Worker task is queued and waiting for capacity.";
  if (status === "PROCESSING") return "Worker is extracting text, generating embeddings, or enriching metadata.";
  if (status === "running") return "Repository sync is fetching and comparing source files.";
  if (status === "queueing") return "Repository sync created work and is waiting for the outbox drainer.";
  return "No detailed error reason was recorded.";
}

function documentJobSubtitle(status: string): string {
  if (status === "PENDING" || status === "QUEUED") return "Ingest queue";
  if (status === "PROCESSING") return "Extracting, embedding, or enriching";
  if (status === "FAILED") return "Document processing failed";
  return "Document processing";
}

function stateRank(state: JobState): number {
  if (state === "failed") return 0;
  if (state === "active") return 1;
  return 2;
}
