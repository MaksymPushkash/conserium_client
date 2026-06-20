"use client";

import { Download, GitCompareArrows, Loader2, NotebookPen, PanelsTopLeft, Trash2 } from "lucide-react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/ui/citation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api/transport";
import { CompareDocumentPreview, CompareDocumentSelect } from "./_components/compare-document-picker";
import { CompareEvidenceTable } from "./_components/compare-evidence-table";
import { compareDimensions, focusExamples, useCompareWorkflow } from "./use-compare-workflow";

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
    historyQuery,
    activeCompare,
    selectedDimensions,
    toggleDimension,
    compareMutation,
    compareSources,
    exportMutation,
    synthesisNoteMutation,
    decisionMemoMutation,
    deleteMutation,
    actionError,
    canCompare,
    selectHistoryItem,
  } = workflow;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Creation"
        title="Compare"
        description="Choose two ready documents, define the angle, and Conserium will build a cited comparison from direct document context."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Ready documents" value={documents.length} detail="Available for comparison" icon={<PanelsTopLeft className="h-4 w-4" />} />
        <MetricCard label="Dimensions" value={selectedDimensions.length} detail="Evidence categories selected" icon={<GitCompareArrows className="h-4 w-4" />} />
        <MetricCard label="Saved results" value={historyQuery.data?.items.length ?? 0} detail="Reusable comparisons" icon={<NotebookPen className="h-4 w-4" />} />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)]">
        <SectionPanel title="Document pair" description="Compare works best when both documents are ready and have enough extracted text.">
          <form className="space-y-4" onSubmit={workflow.submit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-3">
                <CompareDocumentSelect
                  label="Left document"
                  value={leftDocumentId}
                  documents={documents}
                  onChange={setLeftDocumentId}
                />
                <CompareDocumentPreview document={leftDocument} fallback="No left document selected." />
              </div>
              <div className="space-y-3">
                <CompareDocumentSelect
                  label="Right document"
                  value={rightDocumentId}
                  documents={documents}
                  onChange={setRightDocumentId}
                />
                <CompareDocumentPreview document={rightDocument} fallback="No right document selected." />
              </div>
            </div>

            <label className="block space-y-2">
              <span className="font-jetbrains text-xs text-neutral-400">Focus</span>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Focus on tradeoffs, contradictions, or implementation details"
                className="min-h-24"
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

            <div className="space-y-2">
              <span className="font-jetbrains text-xs text-neutral-400">Dimensions</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {compareDimensions.map((dimension) => (
                  <label
                    key={dimension.id}
                    className="font-jetbrains flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDimensions.includes(dimension.id)}
                      onChange={() => toggleDimension(dimension.id)}
                      className="h-3.5 w-3.5 accent-white"
                    />
                    {dimension.label}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={compareMutation.isPending || !canCompare || documentsQuery.isLoading}>
              {compareMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PanelsTopLeft className="h-4 w-4" />}
              Compare documents
            </Button>
          </form>
        </SectionPanel>

        <SectionPanel
          className="self-start"
          title={activeCompare ? `${activeCompare.left_title} vs ${activeCompare.right_title}` : "Comparison output"}
          description="Preview, evidence, exports, and source citations stay together."
          actions={
            activeCompare ? (
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
                <Button
                  variant="secondary"
                  onClick={() => synthesisNoteMutation.mutate()}
                  disabled={synthesisNoteMutation.isPending}
                >
                  <NotebookPen className="h-4 w-4" />
                  Note
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => decisionMemoMutation.mutate()}
                  disabled={decisionMemoMutation.isPending}
                >
                  <PanelsTopLeft className="h-4 w-4" />
                  Memo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(activeCompare.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          }
        >
          <div className="space-y-4">
            {activeCompare ? (
              <>
                <CompareEvidenceTable comparison={activeCompare} />
                <MarkdownPreview title="Comparison" content={activeCompare.markdown} />
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <h2 className="text-sm font-medium text-white">Sources</h2>
                  {compareSources.length ? (
                    <div className="grid gap-3">
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
                className="flex min-h-[360px] flex-col justify-center"
                icon={<GitCompareArrows className="h-5 w-5" />}
                title={documents.length ? "Select two documents" : "No ready documents available"}
                description={
                  documents.length
                    ? "Conserium loads context directly from both selected documents, then ranks the strongest supporting passages."
                    : "Ingest and process at least two documents before running compare."
                }
              />
            )}
          </div>
        </SectionPanel>
      </div>

      {leftDocumentId && rightDocumentId && leftDocumentId === rightDocumentId ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          Choose two different documents.
        </div>
      ) : null}

      {documentsQuery.error ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(documentsQuery.error)}
        </div>
      ) : null}

      {compareMutation.error ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(compareMutation.error)}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(actionError)}
        </div>
      ) : null}

      <SectionPanel title="History" description="Persisted comparisons are reusable across sessions.">
        {historyQuery.data?.items.length ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {historyQuery.data.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectHistoryItem(item.id)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <p className="truncate text-sm font-medium text-white">
                  {item.left_title} vs {item.right_title}
                </p>
                <p className="font-jetbrains mt-1 line-clamp-2 text-xs text-neutral-400">{item.summary}</p>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            className="py-8"
            icon={<GitCompareArrows className="h-5 w-5" />}
            title="No saved comparisons"
            description="Completed comparisons will stay here for reuse."
          />
        )}
      </SectionPanel>
    </PageShell>
  );
}
