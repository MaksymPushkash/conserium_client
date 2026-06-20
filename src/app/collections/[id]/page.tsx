"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, FileText, Folder, GitCompareArrows, MessageSquareText, Network, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { createCollectionShare, createKnowledgeGapNote, getCollectionShare, getCollectionWorkspace, inviteCollectionMember, listCollectionAuditEvents, listCollectionMembers, listCollectionShareAskEvents, removeCollectionMember, revokeCollectionShare, updateCollectionMemberRole, updateCollectionShareSettings } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { CollectionWorkspaceGap } from "@/lib/types";
import {
  ComparisonCard,
  DraftCard,
  EmptyPanelText,
  GapRow,
  LinkButton,
  QuestionCard,
  SharePanel,
  TeamPanel,
  WorkspaceDocumentCard,
  WorkspaceTopicRow,
} from "./_components/collection-workspace-components";

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
  const membersQuery = useQuery({
    queryKey: ["collections", collectionId, "members"],
    queryFn: () => listCollectionMembers(collectionId),
  });
  const auditQuery = useQuery({
    queryKey: ["collections", collectionId, "audit"],
    queryFn: () => listCollectionAuditEvents(collectionId),
  });
  const shareEventsQuery = useQuery({
    queryKey: ["collections", collectionId, "share", "events"],
    queryFn: () => listCollectionShareAskEvents(collectionId),
    enabled: Boolean(shareQuery.data),
  });
  const shareMutation = useMutation({
    mutationFn: createCollectionShare,
    onSuccess: (share) => {
      queryClient.setQueryData(["collections", collectionId, "share"], share);
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "share", "events"] });
    },
  });
  const revokeShareMutation = useMutation({
    mutationFn: revokeCollectionShare,
    onSuccess: () => queryClient.setQueryData(["collections", collectionId, "share"], null),
  });
  const updateShareSettingsMutation = useMutation({
    mutationFn: (payload: { ask_enabled?: boolean; daily_ask_limit?: number }) => updateCollectionShareSettings(collectionId, payload),
    onSuccess: (share) => queryClient.setQueryData(["collections", collectionId, "share"], share),
  });
  const inviteMemberMutation = useMutation({
    mutationFn: (payload: { email: string; role: "viewer" | "editor" }) => inviteCollectionMember(collectionId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "audit"] });
    },
  });
  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: "viewer" | "editor" }) => updateCollectionMemberRole(collectionId, memberId, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "audit"] });
    },
  });
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => removeCollectionMember(collectionId, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["collections", collectionId, "audit"] });
    },
  });
  const createGapNoteMutation = useMutation({
    mutationFn: (gap: CollectionWorkspaceGap) =>
      createKnowledgeGapNote(gap.id ?? `${gap.topic ?? gap.title}-summary`, {
        topic: gap.topic ?? gap.title,
        area_name: gap.title,
        collection_id: collectionId,
      }),
    onSuccess: (note) => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      window.location.href = `/notes?note=${note.id}`;
    },
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
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
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



          <TeamPanel
            members={membersQuery.data?.items ?? []}
            auditEvents={auditQuery.data?.items ?? []}
            pending={inviteMemberMutation.isPending || updateMemberRoleMutation.isPending || removeMemberMutation.isPending}
            canManage={workspace.collection.access_role === "owner"}
            onInvite={(payload) => inviteMemberMutation.mutate(payload)}
            onRoleChange={(memberId, role) => updateMemberRoleMutation.mutate({ memberId, role })}
            onRemove={(memberId) => removeMemberMutation.mutate(memberId)}
          />

          {share ? (
            <SharePanel
              share={share}
              events={shareEventsQuery.data?.items ?? []}
              settingsPending={updateShareSettingsMutation.isPending}
              onToggleAsk={() => updateShareSettingsMutation.mutate({ ask_enabled: !share.ask_enabled })}
              onDailyLimitChange={(dailyLimit) => updateShareSettingsMutation.mutate({ daily_ask_limit: dailyLimit })}
            />
          ) : null}

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
                      <GapRow key={`${gap.id ?? gap.title}-${gap.topic ?? ""}`} gap={gap} collectionId={workspace.collection.id} onCreateNote={() => createGapNoteMutation.mutate(gap)} notePending={createGapNoteMutation.isPending} />
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

          <SectionPanel title="Recent drafts" description="Generated versions from this collection.">
            {workspace.recent_drafts.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {workspace.recent_drafts.map((draft) => <DraftCard key={draft.id} draft={draft} collectionId={workspace.collection.id} />)}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-5 w-5" />}
                title="No collection drafts yet"
                description="Generate a draft from this collection or one of its gaps to build version history."
                action={<LinkButton href={`/drafts?collection=${workspace.collection.id}`}>Draft from collection</LinkButton>}
              />
            )}
          </SectionPanel>

          <SectionPanel title="Recent comparisons" description="Saved compare results where both documents belong to this collection.">
            {workspace.recent_comparisons.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {workspace.recent_comparisons.map((comparison) => <ComparisonCard key={comparison.id} comparison={comparison} />)}
              </div>
            ) : (
              <EmptyState
                icon={<GitCompareArrows className="h-5 w-5" />}
                title="No collection comparisons yet"
                description="Compare two documents from this collection to save a reusable evidence table."
                action={<LinkButton href="/compare">Compare documents</LinkButton>}
              />
            )}
          </SectionPanel>
        </>
      ) : null}
    </PageShell>
  );
}
