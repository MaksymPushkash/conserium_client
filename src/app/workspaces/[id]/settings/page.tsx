"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { deleteWorkspace, listWorkspaceMembers, listWorkspaces, transferWorkspaceOwnership, updateWorkspace } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

export default function WorkspaceSettingsPage() {
  const params = useParams<{ id: string }>();
  const workspaceId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [confirmTransferText, setConfirmTransferText] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [archiveConfirmation, setArchiveConfirmation] = useState("");
  const workspacesQuery = useQuery({ queryKey: ["workspaces"], queryFn: () => listWorkspaces({ limit: 100 }) });
  const membersQuery = useQuery({ queryKey: ["workspaces", workspaceId, "members"], queryFn: () => listWorkspaceMembers(workspaceId) });
  const workspace = workspacesQuery.data?.items.find((item) => item.id === workspaceId) ?? null;
  const activeMembers = useMemo(() => (membersQuery.data?.items ?? []).filter((member) => member.user_id && member.invite_status === "active"), [membersQuery.data?.items]);
  const selectedMember = activeMembers.find((member) => member.id === selectedMemberId) ?? null;
  useEffect(() => {
    if (!workspace) return;
    setName(workspace.name);
    setDescription(workspace.description ?? "");
  }, [workspace]);
  const updateMutation = useMutation({
    mutationFn: () => updateWorkspace(workspaceId, { name, description: description.trim() || null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      await queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "audit"] });
    },
  });
  const archiveMutation = useMutation({
    mutationFn: () => deleteWorkspace(workspaceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      router.replace("/collections");
    },
  });
  const transferMutation = useMutation({
    mutationFn: (memberId: string) => transferWorkspaceOwnership(workspaceId, { member_id: memberId }),
    onSuccess: async () => {
      setSelectedMemberId("");
      setConfirmTransferText("");
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      await queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "members"] });
      await queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "audit"] });
    },
  });
  const canTransfer = workspace?.access_role === "owner" && selectedMember && confirmTransferText === "TRANSFER" && !transferMutation.isPending;
  const canUpdate = workspace?.access_role === "owner" && name.trim().length > 0 && !updateMutation.isPending;
  const canDelete = workspace?.access_role === "owner" && archiveConfirmation === workspace?.name && !archiveMutation.isPending;

  return (
    <PageShell className="max-w-5xl space-y-5">
      <Link href={`/workspaces/${workspaceId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Workspace
      </Link>
      <PageHeader
        eyebrow="Workspace settings"
        title={workspace?.name ?? "Workspace"}
        description="Ownership and member-level controls for this team workspace."
      />
      {workspacesQuery.error ? <ErrorText message={errorMessage(workspacesQuery.error)} /> : null}
      {membersQuery.error ? <ErrorText message={errorMessage(membersQuery.error)} /> : null}
      {updateMutation.error ? <ErrorText message={errorMessage(updateMutation.error)} /> : null}
      {archiveMutation.error ? <ErrorText message={errorMessage(archiveMutation.error)} /> : null}
      {transferMutation.error ? <ErrorText message={errorMessage(transferMutation.error)} /> : null}

      <SectionPanel title="Workspace profile" description="Rename the workspace and update the description shown to members.">
        {workspace?.access_role === "owner" ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (canUpdate) updateMutation.mutate();
            }}
          >
            <label className="grid gap-2">
              <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                className="h-10 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 text-sm text-[var(--conserium-text)] outline-none focus:border-[var(--conserium-text-muted)]"
              />
            </label>
            <label className="grid gap-2">
              <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
                className="min-h-24 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 py-2 text-sm text-[var(--conserium-text)] outline-none focus:border-[var(--conserium-text-muted)]"
              />
            </label>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={!canUpdate}>Save workspace</Button>
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3 text-sm text-[var(--conserium-text-muted)]">Only the workspace owner can edit workspace details.</div>
        )}
      </SectionPanel>

      <SectionPanel title="Owner transfer" description="Transfer ownership only to an active workspace member with a linked Conserium account.">
        {workspace?.access_role === "owner" ? (
          <div className="grid gap-4">
            {activeMembers.length ? (
              <label className="grid gap-2">
                <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-400">New owner</span>
                <select
                  value={selectedMemberId}
                  onChange={(event) => {
                    setSelectedMemberId(event.currentTarget.value);
                    setConfirmTransferText("");
                  }}
                  className="h-10 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 text-sm text-[var(--conserium-text)] outline-none focus:border-[var(--conserium-text-muted)]"
                >
                  <option value="" className="bg-[var(--conserium-card)] text-[var(--conserium-text)]">Select active member</option>
                  {activeMembers.map((member) => (
                    <option key={member.id} value={member.id} className="bg-[var(--conserium-card)] text-[var(--conserium-text)]">{member.email} - {member.role}</option>
                  ))}
                </select>
              </label>
            ) : (
              <EmptyState icon={<Crown className="h-5 w-5" />} title="No active members" description="Invite a member and wait for their account to link before transferring ownership." />
            )}
            <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3 text-sm text-[var(--conserium-text-muted)]">
              After transfer, the selected member becomes owner and the previous owner remains as an editor. Pending invites cannot become owners.
            </div>
            {selectedMember ? (
              <div className="grid gap-3 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3">
                <div>
                  <div className="text-sm font-medium text-[var(--conserium-text)]">Confirm transfer to {selectedMember.email}</div>
                  <p className="mt-1 text-sm text-[var(--conserium-text-muted)]">Type TRANSFER to confirm ownership change. This affects workspace administration immediately.</p>
                </div>
                <input
                  value={confirmTransferText}
                  onChange={(event) => setConfirmTransferText(event.currentTarget.value)}
                  className="h-10 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 font-jetbrains text-sm text-[var(--conserium-text)] outline-none focus:border-[var(--conserium-text-muted)]"
                  placeholder="TRANSFER"
                  aria-label="Confirm owner transfer"
                />
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button variant="secondary" disabled={!canTransfer} onClick={() => selectedMember && transferMutation.mutate(selectedMember.id)}>
                <Crown className="h-4 w-4" />
                Transfer ownership
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3 text-sm text-[var(--conserium-text-muted)]">Only the workspace owner can transfer ownership.</div>
        )}
      </SectionPanel>

      <SectionPanel title="Archive workspace" description="Archive the workspace so it leaves normal workspace lists while preserving the audit trail.">
        {workspace?.access_role === "owner" ? (
          <div className="grid gap-4">
            <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3 text-sm text-[var(--conserium-text-muted)]">
              Type the workspace name to confirm archival. This does not delete documents or audit history, but it removes the team workspace from normal navigation.
            </div>
            <input
              value={archiveConfirmation}
              onChange={(event) => setArchiveConfirmation(event.currentTarget.value)}
              className="h-10 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 font-jetbrains text-sm text-[var(--conserium-text)] outline-none focus:border-[var(--conserium-text-muted)]"
              placeholder={workspace.name}
              aria-label="Confirm workspace archive"
            />
            <div className="flex justify-end">
              <Button variant="destructive" disabled={!canDelete} onClick={() => archiveMutation.mutate()}>Archive workspace</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3 text-sm text-[var(--conserium-text-muted)]">Only the workspace owner can archive the workspace.</div>
        )}
      </SectionPanel>
    </PageShell>
  );
}

function ErrorText({ message }: { message: string }) {
  return <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3 text-sm text-[var(--conserium-text-muted)]">{message}</div>;
}
