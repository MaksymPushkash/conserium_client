"use client";

import { BookOpen, FilePlus, FileText, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  CollectionAuditEvent,
  CollectionMember,
  CollectionShare,
  PublicAskEvent,
  CollectionWorkspaceComparison,
  CollectionWorkspaceDocument,
  CollectionWorkspaceDraft,
  CollectionWorkspaceGap,
  CollectionWorkspaceQuestion,
  CollectionWorkspaceTopic,
} from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

export function ComparisonCard({ comparison }: { comparison: CollectionWorkspaceComparison }) {
  return (
    <Link
      href={`/compare?result=${comparison.id}`}
      className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/25 hover:bg-white/[0.055]"
    >
      <h3 className="line-clamp-2 text-sm font-medium text-white">
        {comparison.left_title} vs {comparison.right_title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-400">{comparison.summary}</p>
      <p className="font-jetbrains mt-2 text-xs text-neutral-500">
        {comparison.dimensions.slice(0, 3).join(" / ")} / {formatDateTime(comparison.created_at)}
      </p>
    </Link>
  );
}

export function DraftCard({ draft, collectionId }: { draft: CollectionWorkspaceDraft; collectionId: string }) {
  return (
    <Link
      href={`/drafts?collection=${collectionId}&draft=${draft.id}${draft.topic ? `&topic=${encodeURIComponent(draft.topic)}` : ""}${draft.knowledge_gap_id ? `&gap=${encodeURIComponent(draft.knowledge_gap_id)}` : ""}`}
      className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/25 hover:bg-white/[0.055]"
    >
      <h3 className="line-clamp-2 text-sm font-medium text-white">{draft.title}</h3>
      <p className="font-jetbrains mt-2 text-xs text-neutral-500">v{draft.version_number} / {new Date(draft.updated_at ?? draft.created_at).toLocaleString()}</p>
    </Link>
  );
}

export function WorkspaceDocumentCard({ document }: { document: CollectionWorkspaceDocument }) {
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

export function WorkspaceTopicRow({ topic }: { topic: CollectionWorkspaceTopic }) {
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

export function GapRow({
  gap,
  collectionId,
  notePending,
  onCreateNote,
}: {
  gap: CollectionWorkspaceGap;
  collectionId: string;
  notePending: boolean;
  onCreateNote: () => void;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-white">{gap.title}</h3>
        <StatusBadge status={gap.severity === "high" ? "failed" : gap.severity === "medium" ? "warning" : "draft"} label={gap.severity} />
      </div>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{gap.reason}</p>
      {gap.coverage_ratio !== null ? (
        <div className="font-jetbrains mt-2 text-xs text-neutral-500">{Math.round(gap.coverage_ratio * 100)}% covered</div>
      ) : null}
      {gap.missing_source_types.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {gap.missing_source_types.slice(0, 4).map((sourceType) => (
            <span key={sourceType} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300">
              {sourceType}
            </span>
          ))}
        </div>
      ) : null}
      {gap.topic ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onCreateNote} disabled={notePending}>
            <FilePlus className="h-4 w-4" />
            Note
          </Button>
          <LinkButton href={`/chat?collection=${collectionId}&topic=${encodeURIComponent(gap.topic)}`} variant="secondary">
            <MessageSquareText className="h-4 w-4" />
            Ask
          </LinkButton>
          <LinkButton href={`/drafts?collection=${collectionId}&topic=${encodeURIComponent(gap.topic)}&gap=${encodeURIComponent(gap.id ?? gap.topic)}`} variant="secondary">
            <FileText className="h-4 w-4" />
            Draft
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}

export function QuestionCard({ question }: { question: CollectionWorkspaceQuestion }) {
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

export function SharePanel({ share, events, settingsPending, onToggleAsk, onDailyLimitChange }: { share: CollectionShare; events: PublicAskEvent[]; settingsPending: boolean; onToggleAsk: () => void; onDailyLimitChange: (dailyLimit: number) => void }) {
  return (
    <SectionPanel title="Public share" description="This collection has an active public page.">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-jetbrains break-all text-sm text-neutral-300">{`/public/${share.slug}`}</div>
          <div className="font-jetbrains mt-1 text-xs text-neutral-500">
            Public Ask {share.ask_enabled ? "enabled" : "disabled"} / {share.daily_ask_limit} asks per day
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onToggleAsk} disabled={settingsPending}>
            {share.ask_enabled ? "Disable Ask" : "Enable Ask"}
          </Button>
          <LinkButton href={`/public/${share.slug}`} variant="secondary">
            Open public page
          </LinkButton>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
        <label className="grid gap-1 text-sm text-neutral-300">
          Daily Ask limit
          <input
            type="number"
            min={1}
            max={500}
            defaultValue={share.daily_ask_limit}
            disabled={settingsPending}
            onBlur={(event) => {
              const value = Number(event.currentTarget.value);
              if (Number.isFinite(value) && value >= 1 && value <= 500 && value !== share.daily_ask_limit) {
                onDailyLimitChange(Math.round(value));
              }
            }}
            className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/30"
          />
        </label>
        <div className="rounded-md border border-white/10 bg-black/40 p-3">
          <div className="text-sm text-neutral-100">Recent public Ask events</div>
          <div className="mt-2 grid gap-2">
            {events.length ? events.slice(0, 5).map((event) => (
              <div key={event.id} className="grid gap-1 rounded-md border border-white/10 bg-white/[0.03] p-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-neutral-200">{event.status === "allowed" ? "Allowed" : "Blocked"}</span>
                  <span className="font-jetbrains text-neutral-500">{formatDateTime(event.created_at)}</span>
                </div>
                <div className="line-clamp-1 text-neutral-400">{event.query_text}</div>
                {event.reason ? <div className="font-jetbrains text-neutral-600">{event.reason}</div> : null}
              </div>
            )) : (
              <div className="rounded-md border border-dashed border-white/10 p-3 text-xs text-neutral-500">No public Ask events yet.</div>
            )}
          </div>
        </div>
      </div>
    </SectionPanel>
  );
}


export function TeamPanel({
  members,
  auditEvents,
  pending,
  canManage,
  onInvite,
  onRoleChange,
  onRemove,
}: {
  members: CollectionMember[];
  auditEvents: CollectionAuditEvent[];
  pending: boolean;
  canManage: boolean;
  onInvite: (payload: { email: string; role: "viewer" | "editor" }) => void;
  onRoleChange: (memberId: string, role: "viewer" | "editor") => void;
  onRemove: (memberId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) => member.email.toLowerCase().includes(term) || member.role.toLowerCase().includes(term));
  }, [members, search]);

  return (
    <SectionPanel title="Team workspace" description="Workspace members inherit collection access from their role.">
      {canManage ? (
        <form
          className="grid gap-2 md:grid-cols-[minmax(0,1fr)_140px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const email = String(form.get("email") ?? "").trim();
            const role = String(form.get("role") ?? "viewer") as "viewer" | "editor";
            if (!email) return;
            onInvite({ email, role });
            event.currentTarget.reset();
          }}
        >
          <input name="email" type="email" placeholder="teammate@example.com" className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/30" />
          <select name="role" defaultValue="viewer" className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/30">
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <Button type="submit" variant="secondary" disabled={pending}>Invite</Button>
        </form>
      ) : (
        <EmptyPanelText>Only workspace owners can invite members or change roles.</EmptyPanelText>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-white">Members</div>
            <input
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search members"
              className="h-8 w-full rounded-md border border-white/10 bg-black px-3 text-xs text-white outline-none focus:border-white/30 sm:w-44"
            />
          </div>
          {filteredMembers.length ? filteredMembers.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="min-w-0">
                <div className="truncate text-sm text-white">{member.email}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <RoleBadge role={member.role} />
                  <StatusPill>{member.invite_status === "active" || member.user_id ? "Active" : "Pending invite"}</StatusPill>
                </div>
              </div>
              {canManage ? (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    disabled={pending}
                    onChange={(event) => onRoleChange(member.id, event.currentTarget.value as "viewer" | "editor")}
                    className="h-8 rounded-md border border-white/10 bg-black px-2 text-xs text-white outline-none focus:border-white/30"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => onRemove(member.id)}>Remove</Button>
                </div>
              ) : null}
            </div>
          )) : (
            <EmptyPanelText>{members.length ? "No members match that search." : "No team members yet."}</EmptyPanelText>
          )}
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium text-white">Audit trail</div>
          {auditEvents.length ? auditEvents.slice(0, 6).map((event) => (
            <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-white">{event.event_type.replaceAll("_", " ")}</span>
                <span className="font-jetbrains text-xs text-neutral-500">{formatDateTime(event.created_at)}</span>
              </div>
              <div className="font-jetbrains mt-2 line-clamp-2 text-xs text-neutral-500">{JSON.stringify(event.metadata)}</div>
            </div>
          )) : (
            <EmptyPanelText>No collection audit events yet.</EmptyPanelText>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}

function RoleBadge({ role }: { role: string }) {
  return <StatusPill>{role === "editor" ? "Editor access" : role === "owner" ? "Owner" : "Viewer access"}</StatusPill>;
}

function StatusPill({ children }: { children: ReactNode }) {
  return <span className="font-jetbrains rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-neutral-400">{children}</span>;
}

export function LinkButton({ href, variant = "secondary", children }: { href: string; variant?: "default" | "secondary"; children: ReactNode }) {
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

export function EmptyPanelText({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.025] p-4 text-sm text-neutral-500">{children}</div>;
}
