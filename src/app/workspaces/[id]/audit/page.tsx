"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { listWorkspaceAuditEvents, listWorkspaces } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { formatDateTime } from "@/lib/utils";

export default function WorkspaceAuditPage() {
  const params = useParams<{ id: string }>();
  const workspaceId = params.id;
  const workspacesQuery = useQuery({ queryKey: ["workspaces"], queryFn: () => listWorkspaces({ limit: 100 }) });
  const auditQuery = useQuery({ queryKey: ["workspaces", workspaceId, "audit"], queryFn: () => listWorkspaceAuditEvents(workspaceId) });
  const workspace = workspacesQuery.data?.items.find((item) => item.id === workspaceId) ?? null;

  return (
    <PageShell className="max-w-5xl space-y-5">
      <Link href={`/workspaces/${workspaceId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Workspace
      </Link>
      <PageHeader eyebrow="Workspace audit" title={workspace?.name ?? "Audit trail"} description="Membership, ownership, and workspace collection changes." />
      {auditQuery.error ? <ErrorText message={errorMessage(auditQuery.error)} /> : null}
      <SectionPanel title="Audit trail" description={`${auditQuery.data?.total ?? 0} recorded workspace event(s).`}>
        {auditQuery.data?.items.length ? (
          <div className="grid gap-2">
            {auditQuery.data.items.map((event) => (
              <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-neutral-100">{event.event_type.replaceAll("_", " ")}</span>
                  <span className="font-jetbrains text-xs text-neutral-500">{formatDateTime(event.created_at)}</span>
                </div>
                <div className="font-jetbrains mt-2 text-xs leading-5 text-neutral-500">{JSON.stringify(event.metadata)}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Search className="h-5 w-5" />} title="No audit events" description="Workspace membership and ownership changes will appear here." />
        )}
      </SectionPanel>
    </PageShell>
  );
}

function ErrorText({ message }: { message: string }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">{message}</div>;
}
