"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateDraft, listCollections, listTopics } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

export default function DraftsPage() {
  const [prompt, setPrompt] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [topicName, setTopicName] = useState("");
  const collectionsQuery = useQuery({ queryKey: ["collections", "drafts"], queryFn: () => listCollections({ limit: 100 }) });
  const topicsQuery = useQuery({ queryKey: ["topics", "drafts"], queryFn: () => listTopics({ limit: 100 }) });
  const draftMutation = useMutation({
    mutationFn: generateDraft,
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    await draftMutation.mutateAsync({
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
                <select
                  value={collectionId}
                  onChange={(event) => setCollectionId(event.target.value)}
                  className="h-9 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/40"
                >
                  <option value="">All collections</option>
                  {(collectionsQuery.data?.items ?? []).map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="font-jetbrains text-xs text-neutral-500">Topic</span>
                <select
                  value={topicName}
                  onChange={(event) => setTopicName(event.target.value)}
                  className="h-9 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/40"
                >
                  <option value="">All topics</option>
                  {(topicsQuery.data?.items ?? []).map((topic) => (
                    <option key={topic.name} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>

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
      </section>

      <section className="min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {draftMutation.data ? (
              <>
                {draftMutation.data.gaps.length ? (
                  <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                    {draftMutation.data.gaps.join(" ")}
                  </div>
                ) : null}
                <MarkdownPreview title="Draft" content={draftMutation.data.markdown} />
                <div className="space-y-2 border-t border-neutral-900 pt-4">
                  <h2 className="text-sm font-medium text-white">Sources</h2>
                  {draftMutation.data.sources.length ? (
                    <div className="grid gap-2">
                      {draftMutation.data.sources.map((source) => (
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
              <div className="rounded-md border border-white/10 bg-white/[0.02] p-6 text-sm text-neutral-500">
                Generated draft output will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
