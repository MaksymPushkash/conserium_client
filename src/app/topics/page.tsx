"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, Pencil, Tags, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTopics, renameTopic } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { formatDateTime } from "@/lib/utils";

export default function TopicsPage() {
  const queryClient = useQueryClient();
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const topicsQuery = useQuery({ queryKey: ["topics"], queryFn: () => listTopics({ limit: 100 }) });
  const renameMutation = useMutation({
    mutationFn: ({ name, nextName }: { name: string; nextName: string }) => renameTopic(name, { display_name: nextName }),
    onSuccess: async () => {
      setEditingTopic(null);
      setDisplayName("");
      await queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
  const topics = topicsQuery.data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Topics</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">Automatic topic groups derived from document tags.</p>
      </header>

      {topicsQuery.error ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(topicsQuery.error)}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => {
          const editing = editingTopic === topic.name;
          return (
          <div
            key={topic.name}
            className="group rounded-xl border border-white/10 bg-white/[0.025] text-white shadow-[0_18px_70px_rgba(0,0,0,0.18)] transition-all duration-200 hover:border-white/25 hover:bg-white/[0.055] focus-within:border-white/25"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="min-w-0">
                {editing ? (
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const nextName = displayName.trim();
                      if (nextName) renameMutation.mutate({ name: topic.name, nextName });
                    }}
                  >
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="h-9 min-w-0 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/25"
                      autoFocus
                    />
                    <button type="submit" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white text-black" aria-label="Save topic name">
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-neutral-400 hover:text-white" onClick={() => setEditingTopic(null)} aria-label="Cancel rename">
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <CardTitle className="truncate">{topic.name}</CardTitle>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {topic.pinned ? <Badge>Pinned</Badge> : null}
                  {topic.source_names.length > 1 ? <Badge>{topic.source_names.length} sources</Badge> : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-neutral-400 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                  onClick={() => {
                    setEditingTopic(topic.name);
                    setDisplayName(topic.name);
                  }}
                  aria-label={`Rename ${topic.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <Tags className="h-4 w-4 text-neutral-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Documents" value={String(topic.document_count)} />
                <Metric label="Latest" value={topic.last_document_at ? formatDateTime(topic.last_document_at) : "None"} />
              </div>
              <Link href={`/topics/${encodeURIComponent(topic.name)}`} className="flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-white">
                Open topic <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </div>
          );
        })}
      </section>
      {!topicsQuery.error && !topics.length ? <div className="py-8 text-sm text-neutral-500">No topics yet.</div> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-jetbrains text-xs text-neutral-500">{label}</div>
      <div className="mt-1 truncate text-sm text-white">{value}</div>
    </div>
  );
}
