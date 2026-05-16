"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopic } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { formatDateTime } from "@/lib/utils";

export default function TopicDetailPage() {
  const params = useParams<{ name: string }>();
  const topicName = decodeURIComponent(params.name);
  const topicQuery = useQuery({
    queryKey: ["topics", topicName],
    queryFn: () => getTopic(topicName, { document_limit: 12 }),
  });
  const topic = topicQuery.data?.topic;
  const documents = topicQuery.data?.documents ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header className="space-y-4 border-b border-neutral-900 pb-6">
        <Link href="/topics" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Topics
        </Link>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="break-words text-3xl font-normal tracking-normal">{topic?.name ?? topicName}</h1>
            <p className="font-jetbrains mt-2 text-xs text-neutral-500">
              {topic ? `${topic.document_count} documents` : "Loading topic"}
              {topic?.last_document_at ? ` / latest ${formatDateTime(topic.last_document_at)}` : ""}
            </p>
          </div>
          <Link href={`/documents?tag=${encodeURIComponent(topicName)}`} className="text-sm text-neutral-500 hover:text-white">
            View in Library
          </Link>
        </div>
      </header>

      {topicQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(topicQuery.error)}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Representative documents</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-900">
          {!topicQuery.error && documents.map((document) => (
            <Link
              key={document.id}
              href={`/documents/${document.id}`}
              className="grid gap-3 py-4 hover:bg-neutral-950 md:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-white">{document.title}</div>
                <div className="font-jetbrains mt-1 text-xs text-neutral-500">{formatDateTime(document.created_at)}</div>
                {document.summary ? <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{document.summary}</p> : null}
              </div>
              <div className="flex items-center gap-2 self-center justify-self-start md:justify-self-end">
                <Badge>{document.type}</Badge>
                <Badge>{document.status}</Badge>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </div>
            </Link>
          ))}
          {!topicQuery.error && !documents.length ? <div className="py-8 text-sm text-neutral-500">No documents in this topic.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
