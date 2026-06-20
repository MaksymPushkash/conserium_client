"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicAnswerShare } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function PublicAnswerPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const answerQuery = useQuery({
    queryKey: ["public-answer", slug],
    queryFn: () => getPublicAnswerShare(slug),
    enabled: Boolean(slug),
  });
  const answer = answerQuery.data;

  return (
    <main className="min-h-screen bg-[var(--conserium-bg)] text-[var(--conserium-text)]">
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
        <header className="border-b border-[var(--conserium-border)] pb-6">
          <Link href="/" className="text-2xl font-normal tracking-tight text-[var(--conserium-text)]">
            CONSERIUM
          </Link>
          <p className="font-jetbrains mt-6 text-xs uppercase tracking-[0.35em] text-[var(--conserium-text-muted)]">Shared answer</p>
          <h1 className="mt-3 text-3xl font-normal tracking-normal">{answer?.query ?? "Shared answer"}</h1>
          <p className="font-jetbrains mt-2 text-xs text-[var(--conserium-text-muted)]">
            {answer ? formatDateTime(answer.created_at) : "Loading"}
          </p>
        </header>

        {answerQuery.isLoading ? <div className="font-jetbrains text-sm text-[var(--conserium-text-muted)]">Loading answer...</div> : null}
        {answerQuery.isError ? (
          <Card>
            <CardContent className="py-6 text-sm text-[var(--conserium-text-muted)]">This shared answer is unavailable.</CardContent>
          </Card>
        ) : null}

        {answer ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-none whitespace-pre-wrap text-sm leading-6 text-[var(--conserium-text)]">
                  {answer.answer}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citations</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {answer.sources.length ? (
                  answer.sources.map((source, index) => (
                    <div key={`${source.citation}-${source.chunk_index}-${index}`} className="rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card-muted)] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{source.citation}</Badge>
                        <div className="text-sm text-[var(--conserium-text)]">{source.document_title ?? "Source"}</div>
                        {source.page_number ? (
                          <span className="font-jetbrains text-xs text-[var(--conserium-text-muted)]">Page {source.page_number}</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--conserium-text-muted)]">{source.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--conserium-text-muted)]">No citations were saved with this answer.</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </main>
  );
}
