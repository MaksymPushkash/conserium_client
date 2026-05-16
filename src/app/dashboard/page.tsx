"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Database, Flame, MessageSquare, Snowflake, Upload } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getStatsOverview, getStatsTimeline, listDocuments } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { StatsTimelineBucket } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const userQuery = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const documentsQuery = useQuery({ queryKey: ["documents", { limit: 5 }], queryFn: () => listDocuments({ limit: 5 }) });
  const statsQuery = useQuery({ queryKey: ["stats", "overview"], queryFn: getStatsOverview });
  const timelineQuery = useQuery({ queryKey: ["stats", "timeline", { months: 6 }], queryFn: () => getStatsTimeline(6) });
  const documents = documentsQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const timeline = timelineQuery.data?.items ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-8">
      <header className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 md:flex-row md:items-end">
        <div>
          <div className="font-jetbrains text-sm text-neutral-500">
            Signed in as {userQuery.isLoading ? "loading..." : userQuery.data?.email ?? "unavailable"}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">Knowledge workspace</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/ingest">
            <Button>
              <Upload className="h-4 w-4" />
              Ingest
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="secondary">
              <MessageSquare className="h-4 w-4" />
              Ask
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Database} label="Documents" value={formatMetric(stats?.total_documents)} detail={`${formatMetric(stats?.ready_documents)} ready`} />
        <MetricCard icon={MessageSquare} label="Queries" value={formatMetric(stats?.query_count)} detail={`${formatMetric(stats?.citation_count)} cited sources`} />
        <MetricCard icon={Flame} label="Hot documents" value={formatMetric(stats?.hot_documents)} detail={`${formatMetric(stats?.active_documents)} active`} />
        <MetricCard icon={Snowflake} label="Cold" value={formatMetric(stats?.cold_documents)} detail="No activity for 14 days" />
        <MetricCard icon={Database} label="Forgotten" value={formatMetric(stats?.forgotten_documents)} detail="No activity for 30 days" />
        <MetricCard icon={Upload} label="Processing" value={formatMetric(stats?.processing_documents)} detail={`${formatMetric(stats?.failed_documents)} failed`} />
      </section>
      {statsQuery.error ? <div className="text-sm text-red-300">{errorMessage(statsQuery.error)}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Learning timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineQuery.error ? <div className="text-sm text-red-300">{errorMessage(timelineQuery.error)}</div> : null}
          {!timelineQuery.error && timeline.length ? <TimelineChart items={timeline} /> : null}
          {!timelineQuery.error && !timeline.length ? <div className="py-8 text-sm text-neutral-500">No learning activity yet.</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent documents</CardTitle>
          <Link href="/documents" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-white">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-neutral-900">
            {documentsQuery.error ? (
              <div className="py-8 text-sm text-red-300">{errorMessage(documentsQuery.error)}</div>
            ) : null}
            {!documentsQuery.error && documents.map((document) => (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="grid gap-3 py-3 hover:bg-neutral-950 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="font-medium text-white">{document.title}</div>
                  <div className="font-jetbrains text-sm text-neutral-500">{formatDateTime(document.created_at)}</div>
                </div>
                <div className="font-jetbrains flex items-center gap-3 self-center justify-self-start md:justify-self-end">
                  <span className="font-jetbrains text-sm font-light leading-none text-neutral-500">{document.type}</span>
                  <StatusPill status={document.status} />
                </div>
              </Link>
            ))}
            {!documentsQuery.error && !documents.length ? <div className="py-8 text-sm text-neutral-500">No documents yet.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Database; label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="font-jetbrains text-sm text-neutral-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
          <div className="mt-1 font-jetbrains text-xs text-neutral-600">{detail}</div>
        </div>
        <Icon className="h-5 w-5 text-neutral-500" />
      </CardContent>
    </Card>
  );
}

function formatMetric(value: number | undefined): string {
  return value === undefined ? "..." : String(value);
}

function TimelineChart({ items }: { items: StatsTimelineBucket[] }) {
  const maxValue = Math.max(
    1,
    ...items.map((item) => item.saved_documents + item.active_documents + item.query_count),
  );
  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const total = item.saved_documents + item.active_documents + item.query_count;
        return (
          <div key={item.month} className="grid gap-2 md:grid-cols-[88px_1fr_220px] md:items-center">
            <div className="font-jetbrains text-xs text-neutral-500">{formatMonth(item.month)}</div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-900">
              <div className="h-full bg-white" style={{ width: `${Math.max(4, (total / maxValue) * 100)}%` }} />
            </div>
            <div className="font-jetbrains text-xs text-neutral-500">
              {item.saved_documents} saved / {item.active_documents} active / {item.query_count} queries
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  return `${month}.${year}`;
}
