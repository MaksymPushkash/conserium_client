"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicCollection, queryPublicCollection } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function PublicCollectionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [question, setQuestion] = useState("");
  const publicQueryMutation = useMutation({
    mutationFn: () => queryPublicCollection(slug, { query: question, limit: 6 }),
  });
  const collectionQuery = useQuery({
    queryKey: ["public-collection", slug],
    queryFn: () => getPublicCollection(slug),
    enabled: Boolean(slug),
  });
  const collection = collectionQuery.data;
  const shareHref = useMemo(() => {
    const path = publicQueryMutation.data?.share.url_path;
    if (!path) return null;
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [publicQueryMutation.data?.share.url_path]);

  return (
    <main className="min-h-screen bg-[var(--conserium-bg)] text-[var(--conserium-text)]">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <header className="flex flex-col gap-4 border-b border-[var(--conserium-border)] pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="text-2xl font-normal tracking-tight text-[var(--conserium-text)]">
              CONSERIUM
            </Link>
            <div className="mt-6 flex items-center gap-3">
              {collection?.color ? (
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: collection.color }} />
              ) : null}
              <h1 className="text-3xl font-normal tracking-normal">{collection?.name ?? "Public collection"}</h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              {collection?.description ?? "Shared knowledge collection."}
            </p>
          </div>
          <div className="font-jetbrains text-xs text-neutral-500">
            {collection ? `${collection.documents.length} documents` : "Loading"}
          </div>
        </header>

        {collectionQuery.isLoading ? <div className="font-jetbrains text-sm text-neutral-500">Loading collection...</div> : null}
        {collectionQuery.isError ? (
          <Card>
            <CardContent className="py-6 text-sm text-neutral-400">This public collection is unavailable.</CardContent>
          </Card>
        ) : null}

        {collection ? (
          <section className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ask this collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask a question about these shared sources"
                  className="h-11 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 text-sm text-[var(--conserium-text)] outline-none transition-colors placeholder:text-[var(--conserium-text-muted)] focus:border-[var(--conserium-text-muted)]"
                />
                <Button
                  onClick={() => publicQueryMutation.mutate()}
                  disabled={publicQueryMutation.isPending || !question.trim() || collection.documents.length === 0}
                >
                  {publicQueryMutation.isPending ? "Asking..." : "Ask"}
                </Button>
              </div>
              {publicQueryMutation.isError ? (
                <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] p-3 text-sm text-[var(--conserium-text)]">
                  Could not answer from this public collection.
                </div>
              ) : null}
              {publicQueryMutation.data ? (
                <div className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] p-4">
                  <div className="max-w-none whitespace-pre-wrap text-sm leading-6 text-[var(--conserium-text)]">
                    {publicQueryMutation.data.answer}
                  </div>
                  {shareHref ? (
                    <div className="mt-4 flex flex-col gap-2 rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] p-3 text-xs text-[var(--conserium-text-muted)] md:flex-row md:items-center md:justify-between">
                      <span className="break-all">Share this answer: {shareHref}</span>
                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={publicQueryMutation.data.share.url_path}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-2 text-xs font-medium text-[var(--conserium-text)] transition-colors hover:border-[var(--conserium-text-muted)]"
                        >
                          Open
                        </Link>
                        <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(shareHref)}>
                          Copy
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {publicQueryMutation.data.sources.length ? (
                    <div className="mt-4 grid gap-2">
                      {publicQueryMutation.data.sources.slice(0, 4).map((source, index) => (
                        <div key={`${source.citation}-${source.chunk_index}-${index}`} className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] p-3 text-xs text-[var(--conserium-text-muted)]">
                          <div className="text-[var(--conserium-text)]">[{index + 1}] {source.document_title ?? "Source"}</div>
                          <div className="mt-1 line-clamp-2">{source.content}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
            {collection.documents.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-sm text-neutral-400">No public documents in this collection yet.</CardContent>
              </Card>
            ) : null}
            {collection.documents.map((document) => (
              <Card key={document.id}>
                <CardHeader>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="break-words">{document.title}</CardTitle>
                      <div className="font-jetbrains mt-2 text-xs text-neutral-500">
                        {document.type} / {document.language ?? "unknown"} / {formatDateTime(document.created_at)}
                      </div>
                    </div>
                    {document.word_count ? <Badge>{document.word_count.toLocaleString()} words</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-6 text-neutral-300">
                    {document.summary ?? "No summary is available for this document."}
                  </p>
                  {document.source_url ? (
                    <a
                      href={document.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-jetbrains block break-all rounded-md bg-[var(--conserium-card)] px-2 py-1 text-xs text-[var(--conserium-text-muted)] hover:text-[var(--conserium-text)]"
                    >
                      {document.source_url}
                    </a>
                  ) : null}
                  {document.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
