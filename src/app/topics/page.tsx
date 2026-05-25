"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Tags } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTopics } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { formatDateTime } from "@/lib/utils";

export default function TopicsPage() {
  const topicsQuery = useQuery({ queryKey: ["topics"], queryFn: () => listTopics({ limit: 100 }) });
  const topics = topicsQuery.data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Topics</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">Automatic topic groups derived from document tags.</p>
      </header>

      {topicsQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(topicsQuery.error)}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.name}
            href={`/topics/${encodeURIComponent(topic.name)}`}
            className="group rounded-xl border border-white/10 bg-white/[0.045] text-white shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate">{topic.name}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-1">
                  {topic.pinned ? <Badge>Pinned</Badge> : null}
                  {topic.source_names.length > 1 ? <Badge>{topic.source_names.length} sources</Badge> : null}
                </div>
              </div>
              <Tags className="h-4 w-4 shrink-0 text-neutral-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Documents" value={String(topic.document_count)} />
                <Metric label="Latest" value={topic.last_document_at ? formatDateTime(topic.last_document_at) : "None"} />
              </div>
              <div className="flex items-center gap-1 text-sm text-neutral-500 transition-colors group-hover:text-white">
                Open topic <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Link>
        ))}
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
