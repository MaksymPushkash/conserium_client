"use client";

import { AlertTriangle, CheckCircle2, GitBranch, Github, RefreshCw, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RepoSync } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useRepoSyncsWorkflow } from "./use-repo-syncs-workflow";

export default function RepoSyncsPage() {
  const workflow = useRepoSyncsWorkflow();
  const {
    repoUrl,
    setRepoUrl,
    branch,
    setBranch,
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
  } = workflow;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="System"
        title="Repo sync"
        description="Sync public GitHub markdown into Cortex collections. Failed and partial syncs stay visible so they can be retried."
        actions={
          <Button
            variant="secondary"
            onClick={workflow.refreshRepoSyncs}
            disabled={repoSyncsQuery.isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard label="Connected repos" value={repoSyncs.length} detail={`${repoMetrics.synced} synced at least once`} icon={<Github className="h-4 w-4" />} />
        <MetricCard label="Running" value={repoMetrics.running} detail="Active sync jobs" icon={<RefreshCw className="h-4 w-4" />} />
        <MetricCard label="Needs attention" value={repoMetrics.failed} detail="Latest attempt failed" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionPanel
          title="Sync setup"
          description="Paste a GitHub repository URL, choose a target collection, then queue markdown ingestion."
          actions={<StatusBadge status={selectedCollectionId ? "ready" : "missing"} label={selectedCollectionId ? "Target ready" : "Need collection"} />}
        >
          <form onSubmit={workflow.submit} className="grid gap-5">
            <label className="grid gap-2">
              <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Repository URL</span>
              <Input
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
                placeholder="https://github.com/owner/repo"
                autoComplete="off"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)]">
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Branch</span>
                <Input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="main" />
              </label>
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Collection</span>
                <select
                  value={selectedCollectionId}
                  onChange={(event) => setCollectionId(event.target.value)}
                  className="h-10 rounded-md border border-white/10 bg-[#17171b] px-3 text-sm text-neutral-100 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/15"
                >
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Include paths</span>
                <Input value={includePaths} onChange={(event) => setIncludePaths(event.target.value)} />
              </label>
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Exclude paths</span>
                <Input value={excludePaths} onChange={(event) => setExcludePaths(event.target.value)} />
              </label>
            </div>

            {lastRunSummary ? <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">{lastRunSummary}</div> : null}
            {lastRunWarnings.length ? (
              <div className="grid gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                {lastRunWarnings.map((warning) => (
                  <div key={warning} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="font-jetbrains text-sm text-neutral-400">Current backend syncs markdown files and stores warnings on partial runs.</p>
              <Button disabled={!repoUrl.trim() || !selectedCollectionId || createMutation.isPending || runMutation.isPending}>
                <Github className="h-4 w-4" />
                Sync repository
              </Button>
            </div>
          </form>
        </SectionPanel>

        <SectionPanel title="What gets indexed" description="Cortex indexes repository knowledge as searchable documents.">
          <div className="grid gap-3">
            <IndexRule icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} title="Markdown first" text="README files, docs folders, and markdown pages become documents." />
            <IndexRule icon={<GitBranch className="h-4 w-4 text-neutral-300" />} title="Branch scoped" text="Each sync uses the selected branch and stores the latest attempt state." />
            <IndexRule icon={<ShieldCheck className="h-4 w-4 text-neutral-300" />} title="Safe retries" text="Failures remain visible. Retry after fixing branch, access, or rate-limit issues." />
          </div>
        </SectionPanel>
      </div>

      <SectionPanel title="Connected repositories" description="Last successful sync and latest failure state are shown separately.">
        {repoSyncs.length ? (
          <div className="grid gap-3">
            {repoSyncs.map((repoSync) => (
              <RepoSyncCard key={repoSync.id} repoSync={repoSync} onRun={() => runMutation.mutate(repoSync.id)} isRunning={runMutation.isPending} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Github className="h-5 w-5" />}
            title="No repositories connected"
            description="Connect a public repository to index markdown docs into a collection."
          />
        )}
      </SectionPanel>
    </PageShell>
  );
}

function RepoSyncCard({ repoSync, onRun, isRunning }: { repoSync: RepoSync; onRun: () => void; isRunning: boolean }) {
  const failed = Boolean(repoSync.last_error);

  return (
    <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/25 hover:bg-white/[0.055] md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <div className="break-words text-base font-medium text-neutral-50">
              {repoSync.owner}/{repoSync.repo}
            </div>
            <div className="font-jetbrains mt-1 text-xs text-neutral-400">branch {repoSync.branch}</div>
          </div>
          <StatusBadge status={repoSync.status} label={repoSync.status} />
        </div>

        <div className="grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="font-jetbrains text-[11px] uppercase tracking-[0.18em] text-neutral-500">Last successful sync</div>
            <div className="mt-1">{repoSync.last_synced_at ? formatDateTime(repoSync.last_synced_at) : "Not synced yet"}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="font-jetbrains text-[11px] uppercase tracking-[0.18em] text-neutral-500">Latest failed attempt</div>
            <div className={failed ? "mt-1 text-red-300" : "mt-1 text-neutral-400"}>{repoSync.last_error || "No recent failure"}</div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-end gap-2">
        <Button variant={failed ? "default" : "secondary"} onClick={onRun} disabled={isRunning}>
          <RefreshCw className="h-4 w-4" />
          {failed ? "Retry" : "Run"}
        </Button>
      </div>
    </div>
  );
}

function IndexRule({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-medium text-neutral-100">{title}</div>
        <p className="font-jetbrains mt-1 text-sm text-neutral-400">{text}</p>
      </div>
    </div>
  );
}
