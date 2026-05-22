"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, BookOpen, FileText, Folder, MessageSquareText, Network, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { createCollectionShare, getCollectionShare, getCollectionWorkspace, revokeCollectionShare } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type {
  CollectionShare,
  CollectionWorkspaceDocument,
  CollectionWorkspaceGap,
  CollectionWorkspaceQuestion,
  CollectionWorkspaceTopic,
} from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

export default function CollectionWorkspacePage() {
  const params = useParams<{ id: string }>();
  const collectionId = params.id;
  const queryClient = useQueryClient();
  const workspaceQuery = useQuery({
    queryKey: ["collections", collectionId, "workspace"],
    queryFn: () => getCollectionWorkspace(collectionId),
  });
  const shareQuery = useQuery({
    queryKey: ["collections", collectionId, "share"],
    queryFn: () => getCollectionShare(collectionId),
  });
  const shareMutation = useMutation({
    mutationFn: createCollectionShare,
    onSuccess: (share) => queryClient.setQueryData(["collections", collectionId, "share"], share),
  });
  const revokeShareMutation = useMutation({
    mutationFn: revokeCollectionShare,
    onSuccess: () => queryClient.setQueryData(["collections", collectionId, "share"], null),
  });

  const workspace = workspaceQuery.data;
  const share = shareQuery.data ?? null;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <Link href="/collections" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Collections
      </Link>

      <PageHeader
        eyebrow="Collection workspace"
        title={workspace?.collection.name ?? "Collection"}
        description={workspace?.collection.description ?? "Documents, topics, gaps, recent Q&A, and source-scoped actions for this collection."}
        actions={
          workspace ? (
            <>
              <LinkButton href={`/chat?collection=${workspace.collection.id}`}>
                <MessageSquareText className="h-4 w-4" />
                Ask
              </LinkButton>
              <LinkButton href={`/drafts?collection=${workspace.collection.id}`} variant="secondary">
                <FileText className="h-4 w-4" />
                Draft
              </LinkButton>
              {share ? (
                <Button variant="ghost" onClick={() => revokeShareMutation.mutate(workspace.collection.id)} disabled={revokeShareMutation.isPending}>
                  Revoke share
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => shareMutation.mutate(workspace.collection.id)} disabled={shareMutation.isPending}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </>
          ) : null
        }
      />

      {workspaceQuery.error ? (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(workspaceQuery.error)}
        </div>
      ) : null}

      {workspace ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Documents" value={workspace.stats.total_documents} detail={`${workspace.stats.ready_documents} ready`} icon={<Folder className="h-4 w-4" />} />
            <MetricCard label="Processing" value={workspace.stats.processing_documents} detail={`${workspace.stats.failed_documents} failed`} icon={<Sparkles className="h-4 w-4" />} />
            <MetricCard label="Topics" value={workspace.stats.topic_count} detail="Collection tags" icon={<Network className="h-4 w-4" />} />
            <MetricCard label="Recent Q&A" value={workspace.stats.recent_question_count} detail="Scoped answers" icon={<MessageSquareText className="h-4 w-4" />} />
            <MetricCard label="Gaps" value={workspace.gaps.length} detail="Coverage checks" icon={<AlertTriangle className="h-4 w-4" />} />
          </div>

          {share ? <SharePanel share={share} /> : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <SectionPanel title="Documents" description="Most recent sources in this workspace.">
              {workspace.documents.length ? (
                <div className="grid gap-3">
                  {workspace.documents.map((document) => (
                    <WorkspaceDocumentCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Folder className="h-5 w-5" />}
                  title="No documents in this collection"
                  description="Add sources or move existing documents here before using scoped chat and drafts."
                  action={<LinkButton href={`/ingest?collection=${workspace.collection.id}`}>Add sources</LinkButton>}
                />
              )}
            </SectionPanel>

            <div className="grid gap-5">
              <SectionPanel title="Topics" description="Dominant tags inside this collection.">
                {workspace.topics.length ? (
                  <div className="grid gap-2">
                    {workspace.topics.map((topic) => (
                      <WorkspaceTopicRow key={topic.name} topic={topic} />
                    ))}
                  </div>
                ) : (
                  <EmptyPanelText>No topic coverage yet.</EmptyPanelText>
                )}
              </SectionPanel>

              <SectionPanel title="Knowledge gaps" description="Operational checks for this workspace.">
                {workspace.gaps.length ? (
                  <div className="grid gap-2">
                    {workspace.gaps.map((gap) => (
                      <GapRow key={gap.title} gap={gap} />
                    ))}
                  </div>
                ) : (
                  <EmptyPanelText>No obvious gaps from current metadata.</EmptyPanelText>
                )}
              </SectionPanel>
            </div>
          </div>

          <SectionPanel title="Recent Q&A" description="Saved answer history scoped to this collection.">
            {workspace.recent_questions.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {workspace.recent_questions.map((question) => (
                  <QuestionCard key={`${question.created_at}-${question.query_text}`} question={question} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquareText className="h-5 w-5" />}
                title="No scoped questions yet"
                description="Ask inside this collection to build reusable answer history."
                action={<LinkButton href={`/chat?collection=${workspace.collection.id}`}>Ask within collection</LinkButton>}
              />
            )}
          </SectionPanel>
        </>
      ) : null}
    </PageShell>
  );
}

function WorkspaceDocumentCard({ document }: { document: CollectionWorkspaceDocument }) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.055]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-medium text-white">{document.title}</h2>
          <p className="font-jetbrains mt-1 text-xs text-neutral-500">{document.type} / updated {formatDateTime(document.updated_at ?? document.created_at)}</p>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-neutral-400">{document.summary ?? "No summary yet."}</p>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={document.activity_temperature} label={document.activity_temperature} />
        {document.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="font-jetbrains rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

function WorkspaceTopicRow({ topic }: { topic: CollectionWorkspaceTopic }) {
  return (
    <Link href={`/topics/${encodeURIComponent(topic.name)}`} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/25 hover:bg-white/[0.055]">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-white">{topic.name}</div>
        <div className="font-jetbrains mt-1 text-xs text-neutral-500">{formatDateTime(topic.last_document_at)}</div>
      </div>
      <span className="font-jetbrains text-xs text-neutral-300">{topic.document_count}</span>
    </Link>
  );
}

function GapRow({ gap }: { gap: CollectionWorkspaceGap }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-white">{gap.title}</h3>
        <StatusBadge status={gap.severity === "high" ? "failed" : gap.severity === "medium" ? "warning" : "draft"} label={gap.severity} />
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{gap.reason}</p>
    </div>
  );
}

function QuestionCard({ question }: { question: CollectionWorkspaceQuestion }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-1 h-4 w-4 shrink-0 text-neutral-400" />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium text-white">{question.query_text}</h3>
          <p className="font-jetbrains mt-1 text-xs text-neutral-500">{question.result_count} sources / {formatDateTime(question.created_at)}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-400">{question.answer_preview ?? "No saved answer text."}</p>
    </div>
  );
}

function SharePanel({ share }: { share: CollectionShare }) {
  return (
    <SectionPanel title="Public share" description="This collection has an active public page.">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="font-jetbrains break-all text-sm text-neutral-300">{`/public/${share.slug}`}</div>
        <LinkButton href={`/public/${share.slug}`} variant="secondary">
          Open public page
        </LinkButton>
      </div>
    </SectionPanel>
  );
}

function LinkButton({ href, variant = "default", children }: { href: string; variant?: "default" | "secondary"; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white/20",
        variant === "default"
          ? "border-white bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-neutral-200"
          : "border-white/10 bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]",
      )}
    >
      {children}
    </Link>
  );
}

function EmptyPanelText({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm text-neutral-500">{children}</div>;
}
