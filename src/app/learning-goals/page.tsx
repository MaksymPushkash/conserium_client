"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pause, Search, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createLearningGoal,
  deleteLearningGoal,
  errorMessage,
  listLearningGoalResources,
  listLearningGoals,
  updateLearningGoal,
} from "@/lib/api";
import type { LearningGoal, RankedLearningResource } from "@/lib/types";

export default function LearningGoalsPage() {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const goalsQuery = useQuery({ queryKey: ["learning-goals"], queryFn: listLearningGoals });
  const createMutation = useMutation({
    mutationFn: createLearningGoal,
    onSuccess: () => {
      setTopic("");
      setDescription("");
      setTargetDate("");
      queryClient.invalidateQueries({ queryKey: ["learning-goals"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" | "completed" }) => updateLearningGoal(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning-goals"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLearningGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning-goals"] }),
  });
  const refreshAllResourcesMutation = useMutation({
    mutationFn: async () => {
      const goals = (goalsQuery.data ?? []).filter((goal) => goal.suggested_resources.length);
      const results = await mapWithConcurrency(goals, 3, async (goal) => ({
          goalId: goal.id,
          resources: await listLearningGoalResources(goal.id, { refresh: true }),
        }));
      results.forEach(({ goalId, resources }) => {
        queryClient.setQueryData(["learning-goals", goalId, "resources"], resources);
      });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      topic,
      description: description || null,
      target_date: targetDate || null,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Learning goals</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">
          Track target topics against saved knowledge coverage.
        </p>
      </header>

      {(goalsQuery.data ?? []).some((goal) => goal.suggested_resources.length) ? (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={() => refreshAllResourcesMutation.mutate()}
            disabled={refreshAllResourcesMutation.isPending}
          >
            {refreshAllResourcesMutation.isPending ? "Refreshing..." : "Refresh all resources"}
          </Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>New goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px_auto]">
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="FastAPI"
              required
              className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
            />
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Build production API confidence"
              className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
            />
            <input
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              type="date"
              className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
            />
            <Button type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

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
                  {goal.description ? <p className="mt-2 text-sm text-neutral-500">{goal.description}</p> : null}
                </div>
                <Badge>{goal.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-jetbrains text-neutral-500">{progress}% covered</span>
                    <span className="font-jetbrains text-neutral-500">
                      {goal.covered_count} covered / {goal.missing_count} missing
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {goal.target_date ? (
                  <div className="font-jetbrains text-xs text-neutral-500">
                    Target {goal.target_date}
                    {goal.days_remaining !== null ? ` · ${deadlineLabel(goal.deadline_status, goal.days_remaining)}` : null}
                  </div>
                ) : null}
                {goal.recommended_next_areas.length ? (
                  <div className="space-y-2">
                    <div className="font-jetbrains text-xs text-neutral-500">Next focus</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.recommended_next_areas.map((area) => (
                        <Badge key={area}>{area}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {goal.gaps.length ? (
                  <div className="space-y-2">
                    <div className="font-jetbrains text-xs text-neutral-500">Missing areas</div>
                    <div className="flex flex-wrap gap-2">
                      {goal.gaps.map((gap) => (
                        <Badge key={gap.name}>{gap.name}</Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No missing areas in the current rubric.</p>
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
        <div className="py-8 text-sm text-neutral-500">No learning goals yet.</div>
      ) : null}
    </div>
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
      ? "Cached"
      : "Refreshed"
    : "Not loaded";

  async function refreshResources() {
    const result = await refreshMutation.mutateAsync();
    queryClient.setQueryData(["learning-goals", goal.id, "resources"], result);
    return result;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-jetbrains text-xs text-neutral-500">Ranked resources</div>
          <div className="font-jetbrains text-xs text-neutral-500">
            {resourceState}
            {newestRefresh ? ` · ${new Date(newestRefresh).toLocaleString()}` : ""}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => resourcesQuery.refetch()} disabled={resourcesQuery.isFetching}>
            {resourcesQuery.isFetching ? "Loading..." : "Load cache"}
          </Button>
          <Button size="sm" variant="secondary" onClick={refreshResources} disabled={refreshMutation.isPending}>
            {refreshMutation.isPending ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
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
            <p className="mt-2 text-xs text-neutral-500">
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

async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
