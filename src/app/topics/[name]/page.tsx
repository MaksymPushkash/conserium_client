"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Pin, PinOff, ShieldOff, Undo2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopic, ignoreTopic, mergeTopic, pinTopic, renameTopic } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { Topic } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function TopicDetailPage() {
  const params = useParams<{ name: string }>();
  const queryClient = useQueryClient();
  const topicName = decodeURIComponent(params.name);
  const [displayName, setDisplayName] = useState(topicName);
  const [sourceNames, setSourceNames] = useState(topicName);
  const [confirmIgnore, setConfirmIgnore] = useState(false);

  const topicQuery = useQuery({
    queryKey: ["topics", topicName],
    queryFn: async () => {
      const result = await getTopic(topicName, { document_limit: 12 });
      setDisplayName(result.topic.name);
      setSourceNames((result.topic.source_names.length ? result.topic.source_names : [result.topic.name]).join(", "));
      return result;
    },
  });
  const topic = topicQuery.data?.topic;
  const documents = topicQuery.data?.documents ?? [];
  const events = topicQuery.data?.events ?? [];
  const normalizedSources = sourceNames.split(",").map((value) => value.trim()).filter(Boolean);

  const topicAction = useMutation({
    mutationFn: (action: TopicAction) => {
      const name = topic?.name ?? topicName;
      if (action.type === "rename") return renameTopic(name, { display_name: action.displayName });
      if (action.type === "merge") return mergeTopic(name, { source_names: action.sourceNames });
      if (action.type === "pin") return pinTopic(name, action.pinned);
      return ignoreTopic(name, action.ignored);
    },
    onSuccess: (updatedTopic: Topic) => {
      setConfirmIgnore(false);
      setDisplayName(updatedTopic.name);
      setSourceNames((updatedTopic.source_names.length ? updatedTopic.source_names : [updatedTopic.name]).join(", "));
      void queryClient.invalidateQueries({ queryKey: ["topics"] });
      void queryClient.invalidateQueries({ queryKey: ["topics", topicName] });
      void queryClient.invalidateQueries({ queryKey: ["knowledge-graph"] });
    },
  });

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
            <div className="font-jetbrains mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>{topic ? `${topic.document_count} documents` : "Loading topic"}</span>
              {topic?.last_document_at ? <span>/ latest {formatDateTime(topic.last_document_at)}</span> : null}
              {topic?.pinned ? <Badge>Pinned</Badge> : null}
              {topic?.ignored ? <Badge>Ignored</Badge> : null}
            </div>
          </div>
          <Link href={`/documents?tag=${encodeURIComponent(topic?.name ?? topicName)}`} className="text-sm text-neutral-500 hover:text-white">
            View in Library
          </Link>
        </div>
      </header>

      {topicQuery.error ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(topicQuery.error)}
        </div>
      ) : null}

      {topic ? (
        <Card>
          <CardHeader>
            <CardTitle>Topic management</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <label className="block text-sm text-neutral-400">
                Display name
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/45 px-3 text-sm text-white outline-none transition-colors focus:border-white/30"
                />
              </label>
              <Button disabled={topicAction.isPending || !displayName.trim()} onClick={() => topicAction.mutate({ type: "rename", displayName })}>
                Rename topic
              </Button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm text-neutral-400">
                Source names
                <input
                  value={sourceNames}
                  onChange={(event) => setSourceNames(event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-white/10 bg-black/45 px-3 text-sm text-white outline-none transition-colors focus:border-white/30"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {normalizedSources.map((sourceName) => (
                  <Badge key={sourceName}>{sourceName}</Badge>
                ))}
              </div>
              <Button disabled={topicAction.isPending || normalizedSources.length < 2} onClick={() => topicAction.mutate({ type: "merge", sourceNames: normalizedSources })}>
                Merge sources
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 lg:col-span-2">
              <Button variant="secondary" disabled={topicAction.isPending} onClick={() => topicAction.mutate({ type: "pin", pinned: !topic.pinned })}>
                {topic.pinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                {topic.pinned ? "Unpin" : "Pin"}
              </Button>
              <Button
                variant="secondary"
                disabled={topicAction.isPending}
                onClick={() => {
                  if (topic.ignored) {
                    topicAction.mutate({ type: "ignore", ignored: false });
                    return;
                  }
                  if (!confirmIgnore) {
                    setConfirmIgnore(true);
                    return;
                  }
                  topicAction.mutate({ type: "ignore", ignored: true });
                }}
              >
                {topic.ignored ? <Undo2 className="mr-2 h-4 w-4" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                {topic.ignored ? "Unignore" : confirmIgnore ? "Confirm ignore" : "Ignore"}
              </Button>
            </div>
            {topicAction.error ? <p className="text-sm text-neutral-400 lg:col-span-2">{errorMessage(topicAction.error)}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Representative documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {!topicQuery.error &&
            documents.map((document) => (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="grid gap-3 rounded-lg border border-transparent bg-white/[0.025] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 md:grid-cols-[1fr_auto]"
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

      {events.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Topic activity</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-neutral-900">
            {events.map((event) => (
              <div key={`${event.action}-${event.created_at}`} className="py-3 text-sm text-neutral-300">
                <div className="font-medium text-white">{topicEventLabel(event.action, event.topic_name, event.display_name)}</div>
                <div className="font-jetbrains mt-1 text-xs text-neutral-500">
                  {formatDateTime(event.created_at)}
                  {event.source_names.length ? ` / ${event.source_names.join(", ")}` : ""}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

type TopicAction =
  | { type: "rename"; displayName: string }
  | { type: "merge"; sourceNames: string[] }
  | { type: "pin"; pinned: boolean }
  | { type: "ignore"; ignored: boolean };

function topicEventLabel(action: string, topicName: string, displayName: string | null) {
  if (action === "renamed") return `Renamed ${topicName} to ${displayName ?? topicName}`;
  if (action === "merged") return `Merged sources into ${displayName ?? topicName}`;
  if (action === "pinned") return `Pinned ${topicName}`;
  if (action === "unpinned") return `Unpinned ${topicName}`;
  if (action === "ignored") return `Ignored ${topicName}`;
  if (action === "unignored") return `Unignored ${topicName}`;
  return action;
}
