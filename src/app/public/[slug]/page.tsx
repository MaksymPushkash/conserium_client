"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicCollection } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function PublicCollectionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const collectionQuery = useQuery({
    queryKey: ["public-collection", slug],
    queryFn: () => getPublicCollection(slug),
    enabled: Boolean(slug),
  });
  const collection = collectionQuery.data;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="text-2xl font-normal tracking-tight text-white">
              CORTEX
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
                      className="font-jetbrains block break-all text-xs text-neutral-500 hover:text-white"
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
