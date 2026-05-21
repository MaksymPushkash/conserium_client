"use client";

import { Download, ExternalLink, FileText, Loader2, Sparkles } from "lucide-react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/ui/citation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api/transport";
import { promptSuggestions, useDraftWorkflow } from "./use-draft-workflow";

export default function DraftsPage() {
  const workflow = useDraftWorkflow();
  const {
    prompt,
    setPrompt,
    collectionId,
    setCollectionId,
    topicName,
    setTopicName,
    collectionsQuery,
    topicsQuery,
    draftMutation,
    exportMutation,
    notionMutation,
    notionErrorText,
    draftSources,
  } = workflow;

  return (
    <PageShell className="grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(420px,0.82fr)_minmax(0,1.18fr)]">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Creation"
          title="Drafts"
          description="Generate cited Markdown from saved Cortex sources. Pick a scope, choose a template, then refine the output."
        />

        <SectionPanel title="Draft workspace" description="Request, scope, and template live together so the context is explicit before generation.">
          <form className="space-y-4" onSubmit={workflow.submit}>
            <label className="block space-y-2">
              <span className="font-jetbrains text-xs text-neutral-400">Request</span>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Write an article about Python generators"
                className="min-h-32"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-400">Collection</span>
                <Select
                  value={collectionId}
                  onChange={(event) => setCollectionId(event.target.value)}
                >
                  <option value="">All collections</option>
                  {(collectionsQuery.data?.items ?? []).map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-400">Topic</span>
                <Select
                  value={topicName}
                  onChange={(event) => setTopicName(event.target.value)}
                >
                  <option value="">All topics</option>
                  {(topicsQuery.data?.items ?? []).map((topic) => (
                    <option key={topic.name} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {promptSuggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => setPrompt(suggestion.prompt)}
                    className="group min-h-20 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300 transition-colors group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{suggestion.title}</span>
                        <span className="mt-1 block font-jetbrains text-sm leading-5 text-neutral-400">{suggestion.description}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button type="submit" className="w-full" disabled={draftMutation.isPending || !prompt.trim()}>
              {draftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Generate draft
            </Button>
          </form>
        </SectionPanel>

        <SectionPanel title="Context state" description="Drafts only use saved sources. Narrow the scope when you need a specific collection or topic.">
          <div className="grid gap-3 text-sm text-neutral-300">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <span>Collection</span>
              <span className="font-jetbrains text-neutral-400">
                {collectionId ? collectionsQuery.data?.items.find((collection) => collection.id === collectionId)?.name : "All collections"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <span>Topic</span>
              <span className="font-jetbrains text-neutral-400">{topicName || "All topics"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <span>Source limit</span>
              <span className="font-jetbrains text-neutral-400">8 chunks</span>
            </div>
          </div>
        </SectionPanel>

        {draftMutation.error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMessage(draftMutation.error)}
          </div>
        ) : null}
        {notionErrorText ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            <div>{notionErrorText}</div>
            {notionErrorText.includes("default Notion parent page") ? (
              <a href="/settings#integrations" className="mt-2 inline-block text-red-100 underline underline-offset-4">
                Open Notion settings
              </a>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="min-w-0">
        <SectionPanel
          title="Markdown preview"
          description="Export as Markdown, PDF, or Notion after the draft has cited enough saved context."
          actions={
            draftMutation.data ? (
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
          <div className="space-y-4">
            {draftMutation.data ? (
              <>
                {notionMutation.data?.url ? (
                  <a
                    href={notionMutation.data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-jetbrains block text-right text-xs text-neutral-500 hover:text-white"
                  >
                    Open Notion page
                  </a>
                ) : null}
                {draftMutation.data.gaps.length ? (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                    {draftMutation.data.gaps.join(" ")}
                  </div>
                ) : null}
                <MarkdownPreview title="Draft" content={draftMutation.data.markdown} />
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
              </>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-5 w-5" />}
                title="No draft generated yet"
                description="Choose a scope, write the request, and Cortex will build a Markdown draft from saved sources only."
              />
            )}
          </div>
        </SectionPanel>
      </section>
    </PageShell>
  );
}
