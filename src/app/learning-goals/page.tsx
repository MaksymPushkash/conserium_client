"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pause, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell, SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  errorMessage,
  listLearningGoalResources,
} from "@/lib/api";
import type { LearningGoal, RankedLearningResource } from "@/lib/types";
import { useLearningGoalsWorkflow } from "./use-learning-goals-workflow";

export default function LearningGoalsPage() {
  const workflow = useLearningGoalsWorkflow();
  const {
    topic,
    setTopic,
    description,
    setDescription,
    targetDate,
    setTargetDate,
    goalsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    refreshAllResourcesMutation,
  } = workflow;

  return (
    <PageShell className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Intelligence"
        title="Learning goals"
        description="Track target topics against saved knowledge coverage."
        actions={
          (goalsQuery.data ?? []).some((goal) => goal.suggested_resources.length) ? (
          <Button
            variant="secondary"
            onClick={() => refreshAllResourcesMutation.mutate()}
            disabled={refreshAllResourcesMutation.isPending}
          >
            {refreshAllResourcesMutation.isPending ? "Refreshing..." : "Refresh all resources"}
          </Button>
          ) : null
        }
      />

      <SectionPanel title="New goal" description="Define the topic, outcome, and optional deadline.">
        <form onSubmit={workflow.submit} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_auto]">
            <Input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="FastAPI"
              required
              className="font-jetbrains"
            />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Build production API confidence"
              className="font-jetbrains"
            />
            <Input
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              type="date"
              className="font-jetbrains"
            />
            <Button type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
          </form>
      </SectionPanel>

      {goalsQuery.error || createMutation.error || updateMutation.error || deleteMutation.error || refreshAllResourcesMutation.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(
            goalsQuery.error ??
              createMutation.error ??
              updateMutation.error ??
              deleteMutation.error ??
              refreshAllResourcesMutation.error,
          )}
        </div>
      ) : null}

      <section className="grid gap-4">
        {(goalsQuery.data ?? []).map((goal) => {
          const progress = Math.round(goal.progress_ratio * 100);
          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle>{goal.topic}</CardTitle>
                  {goal.description ? <p className="font-jetbrains mt-2 text-xs text-neutral-400">{goal.description}</p> : null}
                </div>
                <StatusBadge status={goal.status} label={goal.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-jetbrains text-neutral-400">{progress}% covered</span>
                    <span className="font-jetbrains text-neutral-400">
                      {goal.covered_count} covered / {goal.missing_count} missing
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full transition-all duration-500 ${progress > 0 ? "bg-emerald-400" : "bg-neutral-500"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {goal.target_date ? (
                  <div className="font-jetbrains text-xs text-neutral-400">
                    Target {goal.target_date}
                    {goal.days_remaining !== null ? ` · ${deadlineLabel(goal.deadline_status, goal.days_remaining)}` : null}
                  </div>
                ) : null}
                {goal.recommended_next_areas.length ? (
                  <div className="space-y-2">
                    <div className="font-jetbrains text-xs text-neutral-400">Next focus</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.recommended_next_areas.map((area) => (
                        <Badge key={area}>{area}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {goal.gaps.length ? (
                  <div className="space-y-2">
                    <div className="font-jetbrains text-xs text-neutral-400">Missing areas</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.gaps.map((gap) => (
                        <Badge key={gap.name}>{gap.name}</Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="font-jetbrains text-xs text-neutral-400">No missing areas in the current rubric.</p>
                )}
                {goal.suggested_resources.length ? (
                  <LearningResources goal={goal} />
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => updateMutation.mutate({ id: goal.id, status: "completed" })}>
                    <Check className="h-4 w-4" />
                    Complete
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateMutation.mutate({ id: goal.id, status: goal.status === "paused" ? "active" : "paused" })}>
                    <Pause className="h-4 w-4" />
                    {goal.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {!goalsQuery.isLoading && !(goalsQuery.data ?? []).length ? (
        <div className="font-jetbrains py-8 text-sm text-neutral-400">No learning goals yet.</div>
      ) : null}
    </PageShell>
  );
}

function LearningResources({ goal }: { goal: LearningGoal }) {
  const queryClient = useQueryClient();
  const resourcesQuery = useQuery({
    queryKey: ["learning-goals", goal.id, "resources"],
    queryFn: () => listLearningGoalResources(goal.id),
    enabled: false,
  });
  const refreshMutation = useMutation({
    mutationFn: () => listLearningGoalResources(goal.id, { refresh: true }),
  });
  const resources = resourcesQuery.data?.length ? resourcesQuery.data : goal.suggested_resources;
  const rankedResources = rankedLearningResources(resources);
  const newestRefresh = rankedResources
    .map((resource) => resource.refreshed_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  const resourceState = rankedResources.length
    ? rankedResources.some((resource) => resource.cached)
      ? "Cached recommendations"
      : "Recommended resources ready"
    : "Recommended resources not loaded yet";

  async function refreshResources() {
    const result = await refreshMutation.mutateAsync();
    queryClient.setQueryData(["learning-goals", goal.id, "resources"], result);
    return result;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-jetbrains text-xs text-neutral-400">Ranked resources</div>
          <div className="font-jetbrains text-xs text-neutral-400">
            {resourceState}
            {newestRefresh ? ` · ${new Date(newestRefresh).toLocaleString()}` : ""}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={refreshResources} disabled={refreshMutation.isPending || resourcesQuery.isFetching}>
          {refreshMutation.isPending ? "Loading..." : "Load recommendations"}
        </Button>
      </div>
      {resourcesQuery.error || refreshMutation.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(resourcesQuery.error ?? refreshMutation.error)}
        </div>
      ) : null}
      <div className="grid gap-2 md:grid-cols-3">
        {resources.map((resource) => (
          <a
            key={`${resource.area}-${resource.search_query}`}
            href={resource.url ?? `https://www.google.com/search?q=${encodeURIComponent(resource.search_query)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/10 p-3 text-sm transition-colors hover:border-white/30"
          >
            <div className="flex items-center gap-2 text-white">
              <Search className="h-4 w-4" />
              <span>{resource.title}</span>
            </div>
            <p className="font-jetbrains mt-2 text-xs text-neutral-400">
              {"excerpt" in resource && typeof resource.excerpt === "string" && resource.excerpt ? resource.excerpt : resource.reason}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

function rankedLearningResources(resources: Array<LearningGoal["suggested_resources"][number] | RankedLearningResource>) {
  return resources.filter((resource): resource is RankedLearningResource => "cached" in resource);
}

function deadlineLabel(status: string, daysRemaining: number) {
  if (status === "completed") {
    return "completed";
  }
  if (status === "overdue") {
    return `${Math.abs(daysRemaining)}d overdue`;
  }
  if (daysRemaining === 0) {
    return "due today";
  }
  return `${daysRemaining}d left`;
}
