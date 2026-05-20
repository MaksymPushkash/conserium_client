"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, FileText, Loader2, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { exportMarkdown, exportNotion, generateDraft, listCollections, listTopics } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { downloadBlob } from "@/lib/download";

export default function DraftsPage() {
  const [prompt, setPrompt] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [topicName, setTopicName] = useState("");
  const collectionsQuery = useQuery({ queryKey: ["collections", "drafts"], queryFn: () => listCollections({ limit: 100 }) });
  const topicsQuery = useQuery({ queryKey: ["topics", "drafts"], queryFn: () => listTopics({ limit: 100 }) });
  const draftMutation = useMutation({
    mutationFn: generateDraft,
  });
  const exportMutation = useMutation({
    mutationFn: (format: "markdown" | "pdf") =>
      exportMarkdown({
        title: "Cortex draft",
        markdown: draftMutation.data?.markdown ?? "",
        format,
      }),
    onSuccess: ({ blob, filename }) => downloadBlob(blob, filename),
  });
  const notionMutation = useMutation({
    mutationFn: () =>
      exportNotion({
        title: "Cortex draft",
        markdown: draftMutation.data?.markdown ?? "",
      }),
  });
  const notionErrorText = notionMutation.error ? errorMessage(notionMutation.error) : null;
  const draftSources = draftMutation.data?.sources ?? [];
  const promptSuggestions = [
    "Write a concise technical brief from my saved sources",
    "Turn these sources into an implementation plan",
    "Summarize the tradeoffs and cite the saved documents",
  ];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    draftMutation.mutate({
      prompt: trimmedPrompt,
      collection_id: collectionId || null,
      tag_names: topicName ? [topicName] : null,
      limit: 8,
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 p-4 md:p-8 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="space-y-6">
        <header>
          <h1 className="text-3xl font-normal tracking-normal">Drafts</h1>
          <p className="font-jetbrains mt-2 text-xs text-neutral-500">Generate Markdown from saved Cortex sources only.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Draft from knowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-500">Request</span>
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Write an article about Python generators"
                  className="min-h-44"
                />
              </label>

              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-500">Collection</span>
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
                <span className="font-jetbrains text-xs text-neutral-500">Topic</span>
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

              <div className="grid gap-2">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-left text-xs text-neutral-400 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <Button type="submit" disabled={draftMutation.isPending || !prompt.trim()}>
                {draftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Generate draft
              </Button>
            </form>
          </CardContent>
        </Card>

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
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {draftMutation.data ? (
              <>
                <div className="flex flex-wrap justify-end gap-2">
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
                    onClick={() => notionMutation.mutate()}
                    disabled={notionMutation.isPending}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Notion
                  </Button>
                </div>
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
                <div className="space-y-2 border-t border-neutral-900 pt-4">
                  <h2 className="text-sm font-medium text-white">Sources</h2>
                  {draftSources.length ? (
                    <div className="grid gap-2">
                      {draftSources.map((source) => (
                        <a
                          key={source.chunk_id}
                          href={`/documents/${source.document_id}`}
                          className="block rounded-md border border-white/10 bg-white/[0.02] p-3 text-sm text-neutral-300 hover:border-white/20 hover:text-white"
                        >
                          <span className="font-jetbrains text-xs text-neutral-500">{source.citation}</span>{" "}
                          {source.document_title ?? source.document_id}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No cited saved sources.</p>
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
