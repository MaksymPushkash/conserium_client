import type { DocumentListItem, DocumentStatusResponse, RepoSync } from "@/lib/types";

export type JobKind = "document" | "repo-sync" | "export";
export type JobState = "active" | "failed" | "idle";

export type ProcessingJob = {
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

export const trackedStatuses = ["PENDING", "QUEUED", "PROCESSING", "FAILED"] as const;
