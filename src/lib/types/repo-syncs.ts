export interface RepoSync {
  id: string;
  collection_id: string;
  provider: string;
  owner: string;
  repo: string;
  branch: string;
  include_paths: string[];
  exclude_paths: string[];
  status: string;
  last_error: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface RepoSyncListResponse {
  items: RepoSync[];
}

export interface RepoSyncRunResponse {
  repo_sync: RepoSync;
  created: number;
  updated: number;
  skipped: number;
  deleted: number;
  warnings: string[];
}
