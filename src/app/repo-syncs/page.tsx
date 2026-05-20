"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createRepoSync, listCollections, listRepoSyncs, runRepoSync } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function RepoSyncsPage() {
  const queryClient = useQueryClient();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [collectionId, setCollectionId] = useState("");
  const [lastRunSummary, setLastRunSummary] = useState<string | null>(null);
  const [lastRunWarnings, setLastRunWarnings] = useState<string[]>([]);
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const repoSyncsQuery = useQuery({ queryKey: ["repo-syncs"], queryFn: listRepoSyncs });
  const collections = collectionsQuery.data?.items ?? [];
  const selectedCollectionId = collectionId || collections[0]?.id || "";
  const collectionOptions = useMemo(
    () => collections.map((collection) => ({ id: collection.id, label: collection.name })),
    [collections],
  );

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
  const runMutation = useMutation({
    mutationFn: (id: string) => runRepoSync(id, { max_files: 50 }),
    onSuccess: async (result) => {
      const totalChanges = result.created + result.updated + result.skipped + result.deleted;
      setLastRunSummary(
        totalChanges === 0
          ? "No Markdown files found in this repository branch."
          : `Created ${result.created}, updated ${result.updated}, skipped ${result.skipped}, deleted ${result.deleted}.`,
      );
      setLastRunWarnings(result.warnings ?? []);
      await queryClient.invalidateQueries({ queryKey: ["repo-syncs"] });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!repoUrl.trim() || !selectedCollectionId) return;
    createMutation.mutate({
      collection_id: selectedCollectionId,
      repo_url: repoUrl.trim(),
      branch: branch.trim() || "main",
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Repo sync</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">
          Index public GitHub markdown files into a collection.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Connect repository</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_140px_180px_auto]">
            <Input
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
            />
            <Input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="main" />
            <select
              value={selectedCollectionId}
              onChange={(event) => setCollectionId(event.target.value)}
              className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
            >
              {collectionOptions.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.label}
                </option>
              ))}
            </select>
            <Button disabled={!repoUrl.trim() || !selectedCollectionId || createMutation.isPending || runMutation.isPending}>
              Sync
            </Button>
          </form>
          {lastRunSummary ? <div className="font-jetbrains mt-3 text-xs text-neutral-400">{lastRunSummary}</div> : null}
          {lastRunWarnings.length ? (
            <div className="mt-3 space-y-1 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 font-jetbrains text-xs text-amber-200">
              {lastRunWarnings.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{repoSyncsQuery.data?.items.length ?? 0} repositories</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-white/10">
          {repoSyncsQuery.data?.items.map((repoSync) => (
            <div key={repoSync.id} className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="break-words font-normal text-white">
                  {repoSync.owner}/{repoSync.repo}
                </div>
                <div className="font-jetbrains mt-1 text-xs text-neutral-500">
                  {repoSync.branch} / {repoSync.status} /{" "}
                  {repoSync.last_synced_at ? formatDateTime(repoSync.last_synced_at) : "not synced"}
                </div>
                {repoSync.last_error ? (
                  <div className="font-jetbrains mt-2 text-xs text-red-400">{repoSync.last_error}</div>
                ) : null}
              </div>
              <Button
                variant="secondary"
                onClick={() => runMutation.mutate(repoSync.id)}
                disabled={runMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                Run
              </Button>
            </div>
          ))}
          {repoSyncsQuery.data?.items.length === 0 ? (
            <div className="py-6 text-sm text-neutral-500">No repositories connected.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
