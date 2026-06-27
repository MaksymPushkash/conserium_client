"use client";

import type { RepoSync, RepoSyncListResponse, RepoSyncRunResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listRepoSyncs(): Promise<RepoSyncListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/repo-syncs"));
}

export async function createRepoSync(payload: {
  collection_id: string;
  repo_url: string;
  branch: string;
  include_paths?: string[];
  exclude_paths?: string[];
}): Promise<RepoSync> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/repo-syncs", { body: payload }));
}

export async function runRepoSync(id: string, payload: { max_files?: number } = {}): Promise<RepoSyncRunResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/repo-syncs/{repo_sync_id}/run", {
      params: { path: { repo_sync_id: id } },
      body: { max_files: payload.max_files ?? 50 },
    }),
  );
}
