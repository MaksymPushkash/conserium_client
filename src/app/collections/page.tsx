"use client";

import { ExternalLink, Folder, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import type { Collection, CollectionShare } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { COLLECTION_TEMPLATES, useCollectionsWorkflow } from "./use-collections-workflow";

export default function CollectionsPage() {
  const workflow = useCollectionsWorkflow();
  const {
    name,
    setName,
    description,
    setDescription,
    renamingCollection,
    setRenamingCollection,
    shares,
    collections,
    recentlyUpdated,
    createMutation,
    updateMutation,
    deleteMutation,
    shareMutation,
    revokeShareMutation,
  } = workflow;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Collections"
        description="Separate school, work, coding, research, and project material without changing the rest of your workflow."
        actions={
          <Button variant="secondary" onClick={workflow.createSelectedCollection} disabled={!name.trim() || createMutation.isPending}>
            <Plus className="h-4 w-4" />
            Create
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionPanel title="Create collection" description="Start with a name, or use a template to prefill a useful scope.">
          <form onSubmit={workflow.submit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Name</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Programming" />
              </label>
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Description</span>
                <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Code notes and API references" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => workflow.applyTemplate(template)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-neutral-200 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                >
                  {template.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end border-t border-white/10 pt-4">
              <Button variant="secondary" disabled={!name.trim() || createMutation.isPending}>Create collection</Button>
            </div>
          </form>
        </SectionPanel>

        <SectionPanel title="Workspace scopes" description="Collections become filters for chat, drafts, compare, and public shares.">
          <div className="grid gap-3">
            <CollectionMetric label="Collections" value={collections.length} />
            <CollectionMetric label="Updated scopes" value={recentlyUpdated} />
            <div className="font-jetbrains rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-neutral-400">
              Use fewer broad collections first. Split only when retrieval needs a hard boundary.
            </div>
          </div>
        </SectionPanel>
      </div>

      <SectionPanel title="Saved collections" description="Share, rename, or delete collections from one place.">
        {collections.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                share={shares[collection.id]}
                onShare={() => shareMutation.mutate(collection.id)}
                onRevoke={() => revokeShareMutation.mutate(collection.id)}
                onRename={() => setRenamingCollection({ id: collection.id, name: collection.name })}
                onDelete={() => deleteMutation.mutate(collection.id)}
                isSharing={shareMutation.isPending}
                isRevoking={revokeShareMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Folder className="h-5 w-5" />}
            title="No collections yet"
            description="Create collections for programming, research, projects, or LeetCode to keep retrieval scoped."
          />
        )}
      </SectionPanel>

      {renamingCollection ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Rename collection"
        >
          <form
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#08080c] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            onSubmit={(event) => {
              event.preventDefault();
              workflow.saveRename();
            }}
          >
            <h2 className="text-lg font-medium text-white">Rename collection</h2>
            <Input
              className="mt-4"
              value={renamingCollection.name}
              onChange={(event) => setRenamingCollection({ ...renamingCollection, name: event.target.value })}
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRenamingCollection(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" disabled={!renamingCollection.name.trim() || updateMutation.isPending}>
                Save
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </PageShell>
  );
}

function CollectionCard({
  collection,
  share,
  onShare,
  onRevoke,
  onRename,
  onDelete,
  isSharing,
  isRevoking,
}: {
  collection: Collection;
  share?: CollectionShare;
  onShare: () => void;
  onRevoke: () => void;
  onRename: () => void;
  onDelete: () => void;
  isSharing: boolean;
  isRevoking: boolean;
}) {
  return (
    <div className="group grid min-h-[210px] gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.055]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-neutral-200">
              <Folder className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-medium text-neutral-50">{collection.name}</h2>
              <p className="font-jetbrains text-xs text-neutral-500">updated {formatDateTime(collection.updated_at ?? collection.created_at)}</p>
            </div>
          </div>
          <p className="font-jetbrains mt-3 line-clamp-2 text-sm text-neutral-400">{collection.description || "No description yet."}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-2 text-neutral-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
          aria-label={`Delete ${collection.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-neutral-400">Created</span>
          <span className="font-jetbrains text-xs text-neutral-300">{formatDateTime(collection.created_at)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-neutral-400">Quick actions</span>
          <span className="font-jetbrains text-xs text-neutral-300">scope retrieval</span>
        </div>
      </div>

      {share ? (
        <div className="grid gap-2 rounded-md border border-white/15 bg-white/[0.055] p-3">
          <div className="font-jetbrains break-all text-xs text-neutral-100">{publicShareUrl(share.slug)}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/public/${share.slug}`}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
              View
            </Link>
            <Button variant="ghost" size="sm" onClick={onRevoke} disabled={isRevoking}>
              Revoke
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onShare} disabled={isSharing}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="ghost" size="sm" onClick={onRename}>
          <Pencil className="h-4 w-4" />
          Rename
        </Button>
        <Link
          href={`/collections/${collection.id}`}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-2 text-xs font-medium text-white transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
        >
          Open workspace
        </Link>
      </div>
    </div>
  );
}

function CollectionMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <div className="font-jetbrains text-[11px] uppercase tracking-[0.18em] text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function publicShareUrl(slug: string) {
  if (typeof window === "undefined") {
    return `/public/${slug}`;
  }
  return `${window.location.origin}/public/${slug}`;
}
