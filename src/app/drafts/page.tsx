"use client";

import { FileText, History, Layers3, Loader2, Plus, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { DraftPreview } from "./draft-preview";
import { DraftVersionHistory } from "./draft-version-history";
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
        description="Generate cited Markdown from saved Conserium sources. Pick a scope, choose a template, then refine the output."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Template" value={selectedTemplate} detail="Structured output" icon={<FileText className="h-4 w-4" />} />
        <MetricCard label="Scope" value={selectedDocumentIds.length ? "Documents" : scopeType} detail={collectionId || topicName || "All workspace"} icon={<Layers3 className="h-4 w-4" />} />
        <MetricCard label="Versions" value={versions.length || history.length} detail="Saved draft history" icon={<History className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <SectionPanel title="Draft setup" description="Request and retrieval scope define what Conserium is allowed to use.">
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

            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => setPrompt(suggestion.prompt)}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
                    title={suggestion.description}
                  >
                    <Icon className="h-4 w-4" />
                    {suggestion.title}
                  </button>
                );
              })}
            </div>

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
        </div>
      </div>

      {draftMutation.error ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(draftMutation.error)}
        </div>
      ) : null}
      {notionErrorText ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          <div>{notionErrorText}</div>
          {notionErrorText.includes("default Notion parent page") ? (
            <a href="/settings#integrations" className="mt-2 inline-block text-neutral-200 underline underline-offset-4">
              Open Notion settings
            </a>
          ) : null}
        </div>
      ) : null}

      <DraftPreview
        activeDraft={activeDraft}
        draftSources={draftSources}
        exportMutation={exportMutation}
        notionMutation={notionMutation}
      />

      <DraftVersionHistory
        activeVersionId={activeVersionId}
        history={history}
        versions={versions}
        restoreMutation={restoreMutation}
        restoreHistory={restoreHistory}
        restoreVersion={restoreVersion}
      />
    </PageShell>
  );
}
