"use client";

import { BookOpen, FilePlus, FileText, MessageSquareText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  CollectionShare,
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

export function SharePanel({ share }: { share: CollectionShare }) {
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
