"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";

import { createRepoSync, listCollections, listRepoSyncs, runRepoSync } from "@/lib/api";

export function useRepoSyncsWorkflow() {
  const queryClient = useQueryClient();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [collectionId, setCollectionId] = useState("");
  const [includePaths, setIncludePaths] = useState("README.md, docs/**/*.md, **/*.md");
  const [excludePaths, setExcludePaths] = useState("node_modules/**, .git/**, dist/**");
  const [lastRunSummary, setLastRunSummary] = useState<string | null>(null);
  const [lastRunWarnings, setLastRunWarnings] = useState<string[]>([]);
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const repoSyncsQuery = useQuery({ queryKey: ["repo-syncs"], queryFn: listRepoSyncs });
  const collections = collectionsQuery.data?.items ?? [];
  const repoSyncs = repoSyncsQuery.data?.items ?? [];
  const selectedCollectionId = collectionId || collections[0]?.id || "";
  const repoMetrics = useMemo(() => {
    const running = repoSyncs.filter((sync) => sync.status === "running").length;
    const failed = repoSyncs.filter((sync) => sync.status === "failed").length;
    const synced = repoSyncs.filter((sync) => Boolean(sync.last_synced_at)).length;
    return { running, failed, synced };
  }, [repoSyncs]);

  const runMutation = useMutation({
    mutationFn: (id: string) => runRepoSync(id, { max_files: 50 }),
    onSuccess: async (result) => {
      const totalChanges = result.created + result.updated + result.skipped + result.deleted;
      setLastRunSummary(
        result.repo_sync.status === "queued"
          ? "Repository sync queued. Processing will continue in the background."
          : totalChanges === 0
          ? "No Markdown files changed on this branch."
          : `Created ${result.created}, updated ${result.updated}, skipped ${result.skipped}, deleted ${result.deleted}.`,
      );
      setLastRunWarnings(result.warnings ?? []);
      await queryClient.invalidateQueries({ queryKey: ["repo-syncs"] });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
  const createMutation = useMutation({
    mutationFn: createRepoSync,
    onSuccess: async (repoSync) => {
      setRepoUrl("");
      setLastRunSummary(null);
      setLastRunWarnings([]);
      await queryClient.invalidateQueries({ queryKey: ["repo-syncs"] });
      runMutation.mutate(repoSync.id);
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!repoUrl.trim() || !selectedCollectionId) return;
    createMutation.mutate({
      collection_id: selectedCollectionId,
      repo_url: repoUrl.trim(),
      branch: branch.trim() || "main",
      include_paths: parsePathPatterns(includePaths),
      exclude_paths: parsePathPatterns(excludePaths),
    });
  }

  function refreshRepoSyncs() {
    void queryClient.invalidateQueries({ queryKey: ["repo-syncs"] });
  }

  return {
    repoUrl,
    setRepoUrl,
    branch,
    setBranch,
    collectionId,
    setCollectionId,
    includePaths,
    setIncludePaths,
    excludePaths,
    setExcludePaths,
    lastRunSummary,
    lastRunWarnings,
    collections,
    repoSyncs,
    selectedCollectionId,
    repoMetrics,
    createMutation,
    runMutation,
    repoSyncsQuery,
    submit,
    refreshRepoSyncs,
  };
}

function parsePathPatterns(value: string): string[] {
  return value
    .split(",")
    .map((pattern) => pattern.trim())
    .filter(Boolean);
}
