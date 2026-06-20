
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Folder, Search, Settings, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { inviteWorkspaceMember, listCollections, listWorkspaceAuditEvents, listWorkspaceMembers, listWorkspaces, removeWorkspaceMember, updateWorkspaceMemberRole } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { formatDateTime } from "@/lib/utils";

export default function WorkspaceDetailPage() {
  const params = useParams<{ id: string }>();
  const workspaceId = params.id;
  const queryClient = useQueryClient();
  const [memberSearch, setMemberSearch] = useState("");

  const workspacesQuery = useQuery({ queryKey: ["workspaces"], queryFn: () => listWorkspaces({ limit: 100 }) });
  const membersQuery = useQuery({ queryKey: ["workspaces", workspaceId, "members"], queryFn: () => listWorkspaceMembers(workspaceId) });
  const auditQuery = useQuery({ queryKey: ["workspaces", workspaceId, "audit"], queryFn: () => listWorkspaceAuditEvents(workspaceId) });
  const collectionsQuery = useQuery({ queryKey: ["collections", workspaceId], queryFn: () => listCollections({ limit: 200, workspace_id: workspaceId }) });

  const workspace = workspacesQuery.data?.items.find((item) => item.id === workspaceId) ?? null;
  const workspaceCollections = collectionsQuery.data?.items ?? [];
  const filteredMembers = useMemo(() => {
    const term = memberSearch.trim().toLowerCase();
    const members = membersQuery.data?.items ?? [];
    if (!term) return members;
    return members.filter((member) => member.email.toLowerCase().includes(term) || member.role.toLowerCase().includes(term));
  }, [memberSearch, membersQuery.data?.items]);
  const canManage = workspace?.access_role === "owner";

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: "viewer" | "editor" }) => inviteWorkspaceMember(workspaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "audit"] });
    },
  });
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: "viewer" | "editor" }) => updateWorkspaceMemberRole(workspaceId, memberId, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "audit"] });
    },
  });
  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeWorkspaceMember(workspaceId, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "audit"] });
    },
  });
  const pending = inviteMutation.isPending || updateRoleMutation.isPending || removeMutation.isPending;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <Link href="/collections" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Collections
      </Link>

      <PageHeader
        eyebrow="Team workspace"
        title={workspace?.name ?? "Workspace"}
        description={workspace?.description ?? "Workspace-level members, collections, and audit trail."}
        actions={
          workspace ? (
            <>
              <Link href={`/workspaces/${workspaceId}/audit`}><Button variant="ghost"><Search className="h-4 w-4" /> Audit</Button></Link>
              <Link href={`/workspaces/${workspaceId}/settings`}><Button variant="secondary"><Settings className="h-4 w-4" /> Settings</Button></Link>
              <AccessBadge role={workspace.access_role} />
            </>
          ) : null
        }
      />

      {workspacesQuery.error ? <ErrorText message={errorMessage(workspacesQuery.error)} /> : null}
      {membersQuery.error ? <ErrorText message={errorMessage(membersQuery.error)} /> : null}
      {auditQuery.error ? <ErrorText message={errorMessage(auditQuery.error)} /> : null}

      {workspace ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard label="Collections" value={workspaceCollections.length} detail="Workspace-owned scopes" icon={<Folder className="h-4 w-4" />} />
            <MetricCard label="Members" value={membersQuery.data?.items.length ?? 0} detail="Invited and active" icon={<Users className="h-4 w-4" />} />
            <MetricCard label="Audit events" value={auditQuery.data?.total ?? 0} detail="Workspace changes" icon={<Search className="h-4 w-4" />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <SectionPanel title="Workspace collections" description="Collections inherit this workspace member policy.">
              {workspaceCollections.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {workspaceCollections.map((collection) => (
                    <Link key={collection.id} href={`/collections/${collection.id}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/25 hover:bg-white/[0.055]">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="truncate text-sm font-medium text-neutral-50">{collection.name}</h2>
                        <AccessBadge role={collection.access_role} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{collection.description || "No description."}</p>
                      <p className="font-jetbrains mt-3 text-xs text-neutral-500">updated {formatDateTime(collection.updated_at ?? collection.created_at)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Folder className="h-5 w-5" />} title="No workspace collections" description="Create a collection from /collections and choose this workspace as owner scope." />
              )}
            </SectionPanel>

            <SectionPanel title="Members" description="Workspace roles apply to all workspace-owned collections.">
              {canManage ? (
                <form
                  className="grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const email = String(form.get("email") ?? "").trim();
                    const role = String(form.get("role") ?? "viewer") as "viewer" | "editor";
                    if (!email) return;
                    inviteMutation.mutate({ email, role });
                    event.currentTarget.reset();
                  }}
                >
                  <Input name="email" type="email" placeholder="teammate@example.com" />
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <select name="role" defaultValue="viewer" className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/30">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <Button type="submit" variant="secondary" disabled={pending}>
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-neutral-400">Only owners can change workspace members.</div>
              )}

              <Input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search members" className="mt-4" />
              <div className="mt-3 grid gap-2">
                {filteredMembers.length ? filteredMembers.map((member) => (
                  <div key={member.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm text-neutral-100">{member.email}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <AccessBadge role={member.role} />
                          <AccessBadge role={member.invite_status === "active" ? "active" : "pending"} />
                        </div>
                      </div>
                      {canManage ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            disabled={pending}
                            onChange={(event) => updateRoleMutation.mutate({ memberId: member.id, role: event.currentTarget.value as "viewer" | "editor" })}
                            className="h-8 rounded-md border border-white/10 bg-black px-2 text-xs text-white outline-none focus:border-white/30"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                          </select>
                          <Button size="sm" variant="ghost" disabled={pending} onClick={() => removeMutation.mutate(member.id)}>Remove</Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-neutral-400">No members match this workspace.</div>
                )}
              </div>
            </SectionPanel>
          </div>

          <SectionPanel title="Audit trail" description="Membership and workspace collection events.">
            {auditQuery.data?.items.length ? (
              <div className="grid gap-2">
                {auditQuery.data.items.map((event) => (
                  <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-neutral-100">{event.event_type.replaceAll("_", " ")}</span>
                      <span className="font-jetbrains text-xs text-neutral-500">{formatDateTime(event.created_at)}</span>
                    </div>
                    <div className="font-jetbrains mt-2 line-clamp-2 text-xs text-neutral-500">{JSON.stringify(event.metadata)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-neutral-400">No workspace audit events yet.</div>
            )}
          </SectionPanel>
        </>
      ) : null}
    </PageShell>
  );
}

function ErrorText({ message }: { message: string }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">{message}</div>;
}

function AccessBadge({ role }: { role: string }) {
  const label = role === "owner" ? "Owner" : role === "editor" ? "Editor" : role === "active" ? "Active" : role === "pending" ? "Pending" : "Viewer";
  return <span className="font-jetbrains rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-neutral-400">{label}</span>;
}
