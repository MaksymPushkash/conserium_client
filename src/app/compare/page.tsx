"use client";

import { Download, FileSearch, GitCompareArrows, Loader2, PanelsTopLeft } from "lucide-react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/ui/citation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api/transport";
import type { DocumentListItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { focusExamples, useCompareWorkflow } from "./use-compare-workflow";

export default function ComparePage() {
  const workflow = useCompareWorkflow();
  const {
    leftDocumentId,
    setLeftDocumentId,
    rightDocumentId,
    setRightDocumentId,
    prompt,
    setPrompt,
    documentsQuery,
    documents,
    leftDocument,
    rightDocument,
    compareMutation,
    compareSources,
    exportMutation,
    canCompare,
  } = workflow;

  return (
    <PageShell className="grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(560px,0.95fr)_minmax(0,1.05fr)]">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Creation"
          title="Compare"
          description="Choose two ready documents, define the angle, and Cortex will build a cited comparison from direct document context."
        />

        <SectionPanel title="Document pair" description="Compare works best when both documents are ready and have enough extracted text.">
          <form className="space-y-4" onSubmit={workflow.submit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <DocumentSelect
                  label="Left document"
                  value={leftDocumentId}
                  documents={documents}
                  onChange={setLeftDocumentId}
                />
                <DocumentPreview document={leftDocument} fallback="No left document selected." />
              </div>
              <div className="space-y-3">
                <DocumentSelect
                  label="Right document"
                  value={rightDocumentId}
                  documents={documents}
                  onChange={setRightDocumentId}
                />
                <DocumentPreview document={rightDocument} fallback="No right document selected." />
              </div>
            </div>

            <label className="block space-y-2">
              <span className="font-jetbrains text-xs text-neutral-400">Focus</span>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Focus on tradeoffs, contradictions, or implementation details"
                className="min-h-28"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              {focusExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="font-jetbrains rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-left text-xs text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  {example}
                </button>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={compareMutation.isPending || !canCompare || documentsQuery.isLoading}>
              {compareMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PanelsTopLeft className="h-4 w-4" />}
              Compare documents
            </Button>
          </form>
        </SectionPanel>

        {leftDocumentId && rightDocumentId && leftDocumentId === rightDocumentId ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            Choose two different documents.
          </div>
        ) : null}

        {documentsQuery.error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage(documentsQuery.error)}
          </div>
        ) : null}

        {compareMutation.error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage(compareMutation.error)}
          </div>
        ) : null}
      </section>

      <section className="min-w-0">
        <SectionPanel
          title={compareMutation.data ? `${compareMutation.data.left_title} vs ${compareMutation.data.right_title}` : "Comparison output"}
          description="Markdown preview, exports, and source citations stay together."
          actions={
            compareMutation.data ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => exportMutation.mutate("markdown")}
                  disabled={exportMutation.isPending}
                >
                  <Download className="h-4 w-4" />
                  MD
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => exportMutation.mutate("pdf")}
                  disabled={exportMutation.isPending}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            ) : null
          }
        >
          <div className="space-y-4">
            {compareMutation.data ? (
              <>
                <MarkdownPreview title="Comparison" content={compareMutation.data.markdown} />
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <h2 className="text-sm font-medium text-white">Sources</h2>
                  {compareSources.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {compareSources.map((source, index) => (
                        <CitationCard
                          key={source.chunk_id}
                          index={index + 1}
                          title={source.document_title ?? source.document_id}
                          detail={source.citation}
                          href={`/documents/${source.document_id}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="font-jetbrains text-sm text-neutral-400">No cited saved sources.</p>
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<GitCompareArrows className="h-5 w-5" />}
                title={documents.length ? "Select two documents" : "No ready documents available"}
                description={
                  documents.length
                    ? "Cortex loads context directly from both selected documents, then ranks the strongest supporting passages."
                    : "Ingest and process at least two documents before running compare."
                }
              />
            )}
          </div>
        </SectionPanel>
      </section>
    </PageShell>
  );
}

function DocumentSelect({
  label,
  value,
  documents,
  onChange,
}: {
  label: string;
  value: string;
  documents: DocumentListItem[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-jetbrains text-xs text-neutral-400">{label}</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select document</option>
        {documents.map((document) => (
          <option key={document.id} value={document.id}>
            {document.title}
          </option>
        ))}
      </Select>
    </label>
  );
}

function DocumentPreview({ document, fallback }: { document: DocumentListItem | null; fallback: string }) {
  if (!document) {
    return (
      <div className="font-jetbrains rounded-xl border border-dashed border-white/10 bg-white/[0.035] p-4 text-sm text-neutral-400">
        <FileSearch className="mb-3 h-4 w-4 text-neutral-500" />
        {fallback}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{document.title}</h3>
          <p className="font-jetbrains mt-1 text-xs text-neutral-400">
            {document.type} / {document.word_count ?? 0} words / {formatDateTime(document.created_at)}
          </p>
        </div>
        <StatusBadge status={document.status} />
      </div>
      <p className="font-jetbrains mt-3 line-clamp-3 text-sm leading-5 text-neutral-300">
        {document.summary || "No summary available yet."}
      </p>
    </div>
  );
}
