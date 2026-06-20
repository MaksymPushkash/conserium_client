"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, BookOpenCheck, CalendarDays, CheckCircle2, Database, Flame, Gauge, MessageSquare, ServerCog, Snowflake, Target, Upload } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionCard, MetricCard, PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { getCurrentUser, getDailyDigest, getStatsOverview, getStatsTimeline, getWeeklyReport, listDocuments, listDueFlashcards, listLearningGoalReminders } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { StatsTimelineBucket } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const userQuery = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const documentsQuery = useQuery({ queryKey: ["documents", { limit: 5 }], queryFn: () => listDocuments({ limit: 5 }) });
  const statsQuery = useQuery({ queryKey: ["stats", "overview"], queryFn: getStatsOverview });
  const timelineQuery = useQuery({ queryKey: ["stats", "timeline", { months: 6 }], queryFn: () => getStatsTimeline(6) });
  const dailyDigestQuery = useQuery({ queryKey: ["stats", "daily-digest", { limit: 3 }], queryFn: () => getDailyDigest(3) });
  const weeklyReportQuery = useQuery({ queryKey: ["stats", "weekly-report"], queryFn: getWeeklyReport });
  const dueFlashcardsQuery = useQuery({ queryKey: ["review", "due", { limit: 1 }], queryFn: () => listDueFlashcards(1) });
  const remindersQuery = useQuery({ queryKey: ["learning-goals", "reminders"], queryFn: listLearningGoalReminders });
  const documents = documentsQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const timeline = timelineQuery.data?.items ?? [];
  const digestItems = dailyDigestQuery.data?.items ?? [];
  const weeklyReport = weeklyReportQuery.data;
  const reminders = remindersQuery.data ?? [];
  const onboardingVisible = (stats?.total_documents ?? documents.length) < 5;

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
        <Link href="/review" className="block h-full md:col-span-3">
          <ActionCard
            className="h-full"
            icon={<BookOpenCheck className="h-4 w-4" />}
            title="Review today"
            description={`${formatMetric(dueFlashcardsQuery.data?.total)} flashcards due from saved sources.`}
          />
        </Link>
      </section>

      {onboardingVisible ? <OnboardingCard documentCount={stats?.total_documents ?? documents.length} queryCount={stats?.query_count ?? 0} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Database className="h-4 w-4" />} label="Documents" value={formatMetric(stats?.total_documents)} detail={`${formatMetric(stats?.ready_documents)} ready`} />
        <MetricCard icon={<MessageSquare className="h-4 w-4" />} label="Queries" value={formatMetric(stats?.query_count)} detail={`${formatMetric(stats?.citation_count)} cited sources`} />
        <MetricCard icon={<Flame className="h-4 w-4" />} label="Hot documents" value={formatMetric(stats?.hot_documents)} detail={`${formatMetric(stats?.active_documents)} active`} />
        <MetricCard icon={<Snowflake className="h-4 w-4" />} label="Cold" value={formatMetric(stats?.cold_documents)} detail="No activity for 14 days" />
        <MetricCard icon={<Database className="h-4 w-4" />} label="Forgotten" value={formatMetric(stats?.forgotten_documents)} detail="No activity for 30 days" />
        <Link href="/review" className="block">
          <MetricCard icon={<BookOpenCheck className="h-4 w-4" />} label="Due cards" value={formatMetric(dueFlashcardsQuery.data?.total)} detail="Scheduled review" />
        </Link>
        <Link href="/processing" className="block">
          <MetricCard icon={<ServerCog className="h-4 w-4" />} label="Processing" value={formatMetric(stats?.processing_documents)} detail={`${formatMetric(stats?.failed_documents)} failed`} />
        </Link>
      </section>
      {statsQuery.error ? <div className="text-sm text-neutral-400">{errorMessage(statsQuery.error)}</div> : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <SectionPanel title="Daily digest" description="Questions from older saved sources that should be revisited.">
          {dailyDigestQuery.error ? <div className="text-sm text-neutral-400">{errorMessage(dailyDigestQuery.error)}</div> : null}
          {!dailyDigestQuery.error && digestItems.length ? (
            <div className="grid gap-2">
              {digestItems.map((item) => (
                <Link key={item.document_id} href={`/chat?document=${item.document_id}`} className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.025] p-3 transition hover:border-white/25 hover:bg-white/[0.055]">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-black/30 text-neutral-300">
                      <Bell className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white">{item.question}</div>
                      <div className="font-jetbrains mt-1 text-xs text-neutral-500">{item.title} / {item.reason}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
          {!dailyDigestQuery.error && !digestItems.length ? <div className="py-8 text-sm text-neutral-500">No digest questions yet.</div> : null}
        </SectionPanel>

        <SectionPanel title="Weekly report" description={weeklyReport?.summary ?? "Workspace activity for the last 7 days."}>
          {weeklyReportQuery.error ? <div className="text-sm text-neutral-400">{errorMessage(weeklyReportQuery.error)}</div> : null}
          {!weeklyReportQuery.error && weeklyReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <ReportMetric label="Saved" value={weeklyReport.saved_documents} />
                <ReportMetric label="Active" value={weeklyReport.active_documents} />
                <ReportMetric label="Queries" value={weeklyReport.query_count} />
                <ReportMetric label="Stale" value={weeklyReport.stale_documents} />
              </div>
              <div className="space-y-2">
                {(weeklyReport.recommended_actions ?? []).map((action) => (
                  <div key={action} className="flex gap-2 rounded-md border border-white/10 bg-white/[0.025] p-3 text-sm text-neutral-300">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </SectionPanel>
      </section>

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
      {remindersQuery.error ? <div className="text-sm text-neutral-400">{errorMessage(remindersQuery.error)}</div> : null}

      <SectionPanel title="Workspace activity" description="Saved, active, and queried material over time.">
          {timelineQuery.error ? <div className="text-sm text-neutral-400">{errorMessage(timelineQuery.error)}</div> : null}
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
              <div className="py-8 text-sm text-neutral-400">{errorMessage(documentsQuery.error)}</div>
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

function ReportMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="font-jetbrains text-[11px] uppercase tracking-[0.2em] text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl text-white">{value}</div>
    </div>
  );
}

function TimelineChart({ items }: { items: StatsTimelineBucket[] }) {
  const maxValue = Math.max(
    1,
    ...items.map((item) => item.saved_documents + item.active_documents + item.query_count),
  );
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-4 font-jetbrains text-xs text-neutral-500">
        <LegendSwatch className="bg-neutral-200" label="Saved" />
        <LegendSwatch className="bg-neutral-300" label="Active" />
        <LegendSwatch className="bg-neutral-500" label="Queries" />
      </div>
      {items.map((item) => {
        const total = item.saved_documents + item.active_documents + item.query_count;
        const savedWidth = total ? (item.saved_documents / maxValue) * 100 : 0;
        const activeWidth = total ? (item.active_documents / maxValue) * 100 : 0;
        const queryWidth = total ? (item.query_count / maxValue) * 100 : 0;
        const tooltip = `${item.saved_documents} saved · ${item.active_documents} active · ${item.query_count} queries`;
        return (
          <div key={item.month} className="grid gap-2 md:grid-cols-[88px_1fr_220px] md:items-center">
            <div className="font-jetbrains text-xs text-neutral-500">{formatMonth(item.month)}</div>
            <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.06]" title={tooltip}>
              <div className="h-full bg-neutral-200" style={{ width: `${savedWidth}%` }} />
              <div className="h-full bg-neutral-300" style={{ width: `${activeWidth}%` }} />
              <div className="h-full bg-neutral-500" style={{ width: `${queryWidth}%` }} />
              {!total ? <div className="h-full w-1 bg-white/20" /> : null}
            </div>
            <div className="font-jetbrains text-xs text-neutral-500">
              {tooltip}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function OnboardingCard({ documentCount, queryCount }: { documentCount: number; queryCount: number }) {
  const steps = [
    { label: "Add your first source", href: "/ingest", complete: documentCount > 0 },
    { label: "Ask your first question", href: "/chat", complete: queryCount > 0 },
    { label: "Review what is missing", href: "/knowledge-gaps", complete: documentCount >= 3 },
  ];
  const completed = steps.filter((step) => step.complete).length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <Card className="border-white/10 bg-white/[0.025]">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Set up Conserium</CardTitle>
          <p className="font-jetbrains mt-2 text-xs text-neutral-500">Complete the first loop: save, ask, then find the gap.</p>
        </div>
        <div className="font-jetbrains text-sm text-neutral-400">{progress}%</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {steps.map((step) => (
            <Link key={step.label} href={step.href} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 text-sm text-neutral-300 transition hover:border-white/25 hover:bg-white/[0.055] hover:text-white">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/30">
                {step.complete ? <CheckCircle2 className="h-4 w-4 text-neutral-200" /> : <ArrowRight className="h-4 w-4 text-neutral-500" />}
              </span>
              {step.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
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
