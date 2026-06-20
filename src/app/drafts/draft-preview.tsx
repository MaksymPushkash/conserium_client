import { Download, ExternalLink, Sparkles } from "lucide-react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/ui/citation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionPanel } from "@/components/ui/page-shell";

import type { useDraftWorkflow } from "./use-draft-workflow";

type DraftWorkflow = ReturnType<typeof useDraftWorkflow>;

export function DraftPreview({
  activeDraft,
  draftSources,
  exportMutation,
  notionMutation,
}: Pick<DraftWorkflow, "activeDraft" | "draftSources" | "exportMutation" | "notionMutation">) {
  return (
    <SectionPanel
      title="Markdown preview"
      description="Export as Markdown, PDF, or Notion after the draft has cited enough saved context."
      actions={
        activeDraft ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => exportMutation.mutate("markdown")} disabled={exportMutation.isPending}>
              <Download className="h-4 w-4" />
              MD
            </Button>
            <Button variant="secondary" onClick={() => exportMutation.mutate("pdf")} disabled={exportMutation.isPending}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="secondary" onClick={() => notionMutation.mutate()} disabled={notionMutation.isPending}>
              <ExternalLink className="h-4 w-4" />
              Notion
            </Button>
          </div>
        ) : null
      }
    >
      {activeDraft ? (
        <div className="space-y-4">
          {notionMutation.data?.url ? (
            <a href={notionMutation.data.url} target="_blank" rel="noreferrer" className="font-jetbrains block text-right text-xs text-neutral-500 hover:text-white">
              Open Notion page
            </a>
          ) : null}
          {activeDraft.gaps?.length ? (
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
              {activeDraft.gaps.join(" ")}
            </div>
          ) : null}
          <MarkdownPreview title="Draft" content={activeDraft.markdown} />
          <div className="space-y-2 border-t border-white/10 pt-4">
            <h2 className="text-sm font-medium text-white">Sources</h2>
            {draftSources.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {draftSources.map((source, index) => (
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
        </div>
      ) : (
        <EmptyState
          className="flex min-h-[180px] flex-col justify-center"
          icon={<Sparkles className="h-5 w-5" />}
          title="No draft generated yet"
          description="Choose a scope, write the request, and Conserium will build a Markdown draft from saved sources only."
        />
      )}
    </SectionPanel>
  );
}
