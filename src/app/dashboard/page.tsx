"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Database, Flame, Gauge, MessageSquare, ServerCog, Snowflake, Target, Upload } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard, MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { getCurrentUser, getStatsOverview, getStatsTimeline, listDocuments, listLearningGoalReminders } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { StatsTimelineBucket } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const userQuery = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const documentsQuery = useQuery({ queryKey: ["documents", { limit: 5 }], queryFn: () => listDocuments({ limit: 5 }) });
  const statsQuery = useQuery({ queryKey: ["stats", "overview"], queryFn: getStatsOverview });
  const timelineQuery = useQuery({ queryKey: ["stats", "timeline", { months: 6 }], queryFn: () => getStatsTimeline(6) });
  const remindersQuery = useQuery({ queryKey: ["learning-goals", "reminders"], queryFn: listLearningGoalReminders });
  const documents = documentsQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const timeline = timelineQuery.data?.items ?? [];
  const reminders = remindersQuery.data ?? [];

  return (
    <PageShell className="flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow={userQuery.isLoading ? "Workspace" : userQuery.data?.email ?? "Workspace"}
        title="Knowledge workspace"
        description="Search, organize, and ask questions across saved sources."
      />

      <section className="grid items-stretch gap-3 md:grid-cols-3">
        <Link href="/ingest" className="block h-full">
          <ActionCard
            className="h-full"
            icon={<Upload className="h-4 w-4" />}
            title="Upload source"
            description="Add PDFs, notes, URLs, images, or markdown."
          />
        </Link>
        <Link href="/chat" className="block h-full">
          <ActionCard
            className="h-full"
            icon={<MessageSquare className="h-4 w-4" />}
            title="Ask your knowledge"
            description="Query saved material with citations."
          />
        </Link>
        <Link href="/knowledge-gaps" className="block h-full">
          <ActionCard
            className="h-full"
            icon={<Gauge className="h-4 w-4" />}
            title="Review gaps"
            description="See what your workspace does not cover yet."
          />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Database className="h-4 w-4" />} label="Documents" value={formatMetric(stats?.total_documents)} detail={`${formatMetric(stats?.ready_documents)} ready`} />
        <MetricCard icon={<MessageSquare className="h-4 w-4" />} label="Queries" value={formatMetric(stats?.query_count)} detail={`${formatMetric(stats?.citation_count)} cited sources`} />
        <MetricCard icon={<Flame className="h-4 w-4" />} label="Hot documents" value={formatMetric(stats?.hot_documents)} detail={`${formatMetric(stats?.active_documents)} active`} />
        <MetricCard icon={<Snowflake className="h-4 w-4" />} label="Cold" value={formatMetric(stats?.cold_documents)} detail="No activity for 14 days" />
        <MetricCard icon={<Database className="h-4 w-4" />} label="Forgotten" value={formatMetric(stats?.forgotten_documents)} detail="No activity for 30 days" />
        <Link href="/processing" className="block">
          <MetricCard icon={<ServerCog className="h-4 w-4" />} label="Processing" value={formatMetric(stats?.processing_documents)} detail={`${formatMetric(stats?.failed_documents)} failed`} />
        </Link>
      </section>
      {statsQuery.error ? <div className="text-sm text-red-300">{errorMessage(statsQuery.error)}</div> : null}

      {reminders.length ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Learning reminders</CardTitle>
            <Link href="/learning-goals" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-white">
              View goals <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {reminders.slice(0, 4).map((goal) => (
              <Link key={goal.id} href="/learning-goals" className="rounded-md border border-white/10 p-4 hover:border-white/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-white">{goal.topic}</div>
                  <Target className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="font-jetbrains mt-2 text-xs text-neutral-500">
                  {deadlineLabel(goal.deadline_status, goal.days_remaining)} / {goal.missing_count} gaps
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {remindersQuery.error ? <div className="text-sm text-red-300">{errorMessage(remindersQuery.error)}</div> : null}

      <SectionPanel title="Workspace activity" description="Saved, active, and queried material over time.">
          {timelineQuery.error ? <div className="text-sm text-red-300">{errorMessage(timelineQuery.error)}</div> : null}
          {!timelineQuery.error && timeline.length ? <TimelineChart items={timeline} /> : null}
          {!timelineQuery.error && !timeline.length ? <div className="py-8 text-sm text-neutral-400">No learning activity yet.</div> : null}
      </SectionPanel>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent documents</CardTitle>
          <Link href="/documents" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-white">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documentsQuery.error ? (
              <div className="py-8 text-sm text-red-300">{errorMessage(documentsQuery.error)}</div>
            ) : null}
            {!documentsQuery.error && documents.map((document) => (
              <Link
                key={document.id}
                href={`/documents/${document.id}`}
                className="grid gap-3 rounded-lg border border-transparent px-3 py-3 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.055] hover:shadow-sm md:grid-cols-[1fr_auto]"
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
    </PageShell>
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
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-neutral-500 via-neutral-300 to-white" style={{ width: `${Math.max(4, (total / maxValue) * 100)}%` }} />
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

function deadlineLabel(status: string, daysRemaining: number | null): string {
  if (daysRemaining === null) {
    return status;
  }
  if (status === "overdue") {
    return `${Math.abs(daysRemaining)}d overdue`;
  }
  if (daysRemaining === 0) {
    return "due today";
  }
  return `${daysRemaining}d left`;
}
