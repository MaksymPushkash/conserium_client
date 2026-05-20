"use client";

import type { RepoSync, RepoSyncListResponse, RepoSyncRunResponse } from "@/lib/types";
import { request } from "./transport";

export function listRepoSyncs(): Promise<RepoSyncListResponse> {
  return request<RepoSyncListResponse>("/repo-syncs");
}

export function createRepoSync(payload: {
  collection_id: string;
  repo_url: string;
  branch: string;
}): Promise<RepoSync> {
  return request<RepoSync>("/repo-syncs", { method: "POST", body: JSON.stringify(payload) });
}

export function runRepoSync(id: string, payload: { max_files?: number } = {}): Promise<RepoSyncRunResponse> {
  return request<RepoSyncRunResponse>(`/repo-syncs/${id}/run`, {
    method: "POST",
    body: JSON.stringify({ max_files: payload.max_files ?? 50 }),
  });
}
