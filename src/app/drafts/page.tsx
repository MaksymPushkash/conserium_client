"use client";

import { Download, ExternalLink, FileText, History, Layers3, Loader2, Plus, RotateCcw, Sparkles, X } from "lucide-react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/ui/citation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
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
    scopeType,
    setScopeType,
    templateId,
    setTemplateId,
    selectedDocumentIds,
    outlineSections,
    collectionsQuery,
    topicsQuery,
    templatesQuery,
    documentsQuery,
    outlineMutation,
    draftMutation,
    restoreMutation,
    exportMutation,
    notionMutation,
    notionErrorText,
    activeDraft,
    draftSources,
    history,
    versions,
    generateOutline,
    toggleDocument,
    updateOutlineSection,
    addOutlineSection,
    removeOutlineSection,
    restoreHistory,
    restoreVersion,
  } = workflow;
  const activeVersionId = activeDraft ? ("current_version_id" in activeDraft ? activeDraft.current_version_id : activeDraft.version_id) : null;
  const selectedTemplate = templatesQuery.data?.items.find((template) => template.id === templateId)?.name ?? templateId;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Creation"
        title="Drafts"
        description="Generate cited Markdown from saved Cortex sources. Pick a scope, choose a template, then refine the output."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Template" value={selectedTemplate} detail="Structured output" icon={<FileText className="h-4 w-4" />} />
        <MetricCard label="Scope" value={selectedDocumentIds.length ? "Documents" : scopeType} detail={collectionId || topicName || "All workspace"} icon={<Layers3 className="h-4 w-4" />} />
        <MetricCard label="Versions" value={versions.length || history.length} detail="Saved draft history" icon={<History className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <SectionPanel title="Draft setup" description="Request and retrieval scope define what Cortex is allowed to use.">
          <form className="space-y-4" onSubmit={workflow.submit}>
            <label className="block space-y-2">
              <span className="font-jetbrains text-xs text-neutral-400">Request</span>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Write an article about Python generators"
                className="min-h-28"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-400">Template</span>
                <Select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                  {(templatesQuery.data?.items ?? []).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-400">Mode</span>
                <Select value={scopeType} onChange={(event) => setScopeType(event.target.value)}>
                  <option value="all">All workspace</option>
                  <option value="collection">Collection</option>
                  <option value="topic">Topic</option>
                  <option value="documents">Selected documents</option>
                  <option value="knowledge_gap">Knowledge gap</option>
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-400">Collection</span>
                <Select value={collectionId} onChange={(event) => setCollectionId(event.target.value)}>
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
                <Select value={topicName} onChange={(event) => setTopicName(event.target.value)}>
                  <option value="">All topics</option>
                  {(topicsQuery.data?.items ?? []).map((topic) => (
                    <option key={topic.name} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-jetbrains text-xs text-neutral-400">Selected documents</span>
                <span className="font-jetbrains text-xs text-neutral-500">{selectedDocumentIds.length} selected</span>
              </div>
              <div className="grid max-h-40 gap-2 overflow-y-auto pr-1">
                {(documentsQuery.data?.items ?? []).slice(0, 10).map((document) => (
                  <label key={document.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] p-2 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.05]">
                    <input
                      type="checkbox"
                      checked={selectedDocumentIds.includes(document.id)}
                      onChange={() => toggleDocument(document.id)}
                      className="h-4 w-4 accent-white"
                    />
                    <span className="min-w-0 flex-1 truncate">{document.title}</span>
                    <span className="font-jetbrains text-xs text-neutral-500">{document.type}</span>
                  </label>
                ))}
                {documentsQuery.data && !documentsQuery.data.items.length ? (
                  <p className="font-jetbrains text-xs text-neutral-500">No ready documents match this scope.</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="font-jetbrains text-sm text-neutral-400">Generation uses only saved sources inside the selected scope.</p>
              <Button type="submit" disabled={draftMutation.isPending || !prompt.trim()}>
                {draftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Generate draft
              </Button>
            </div>
          </form>
        </SectionPanel>

        <div className="space-y-5">
          <SectionPanel
            title="Editable outline"
            description="Generate an outline first, then adjust sections before final draft generation."
            actions={
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={generateOutline} disabled={outlineMutation.isPending || !prompt.trim()}>
                  {outlineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Outline
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={addOutlineSection}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            }
          >
            <div className="grid gap-2">
              {outlineSections.map((section, index) => (
                <div key={`${section}-${index}`} className="flex gap-2">
                  <Textarea
                    value={section}
                    onChange={(event) => updateOutlineSection(index, event.target.value)}
                    className="min-h-10 py-2"
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeOutlineSection(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </SectionPanel>

          <SectionPanel title="Fast prompts" description="Use these to set the request without leaving the workflow.">
            <div className="grid gap-2">
              {promptSuggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => setPrompt(suggestion.prompt)}
                    className="group rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    <span className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">{suggestion.title}</span>
                        <span className="mt-1 block font-jetbrains text-xs leading-5 text-neutral-400">{suggestion.description}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionPanel>
        </div>
      </div>

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
              <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
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
            description="Choose a scope, write the request, and Cortex will build a Markdown draft from saved sources only."
          />
        )}
      </SectionPanel>

      <SectionPanel title="Version history" description="Recent generated drafts and server versions.">
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="grid content-start gap-2">
            {history.length ? (
              history.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => restoreHistory(item)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.055]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{item.title}</span>
                    <span className="font-jetbrains text-xs text-neutral-500">{new Date(item.created_at).toLocaleString()}</span>
                  </span>
                  <RotateCcw className="h-4 w-4 text-neutral-400" />
                </button>
              ))
            ) : (
              <p className="font-jetbrains text-sm text-neutral-500">No generated drafts yet.</p>
            )}
          </div>
          <div className="grid content-start gap-2">
            {versions.length ? (
              versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
                  <span className="min-w-0">
                    <span className="block text-sm text-white">Version {version.version_number}</span>
                    <span className="font-jetbrains text-xs text-neutral-500">{new Date(version.created_at).toLocaleString()}</span>
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => restoreVersion(version.id)}
                    disabled={restoreMutation.isPending || version.id === activeVersionId}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </Button>
                </div>
              ))
            ) : (
              <p className="font-jetbrains text-sm text-neutral-500">No server versions selected.</p>
            )}
          </div>
        </div>
      </SectionPanel>
    </PageShell>
  );
}
