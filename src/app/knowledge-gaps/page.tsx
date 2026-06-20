"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FilePlus, Gauge, Loader2, MessageSquareText, Search, X } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { createKnowledgeGapNote, getKnowledgeGaps, listKnowledgeGaps, listLearningPaths, listQuizWeakAreas, listTopics } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import type { KnowledgeGapArea, LearningPath } from "@/lib/types";

export default function KnowledgeGapsPage() {
  const queryClient = useQueryClient();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const topicsQuery = useQuery({ queryKey: ["topics", "knowledge-gaps"], queryFn: () => listTopics({ limit: 100 }) });
  const overviewQuery = useQuery({ queryKey: ["knowledge-gaps", "overview"], queryFn: () => listKnowledgeGaps({ limit: 8 }) });
  const weakAreasQuery = useQuery({ queryKey: ["review", "quiz-weak-areas", "gaps"], queryFn: () => listQuizWeakAreas(8) });
  const learningPathsQuery = useQuery({ queryKey: ["review", "learning-paths", "gaps"], queryFn: () => listLearningPaths(6) });
  const topics = topicsQuery.data?.items ?? [];
  const activeTopic = topicInput.trim() || selectedTopic || overviewQuery.data?.items[0]?.topic || topics[0]?.name || "";
  const gapsQuery = useQuery({
    queryKey: ["knowledge-gaps", activeTopic],
    queryFn: () => getKnowledgeGaps(activeTopic),
    enabled: Boolean(activeTopic),
  });
  const createNoteMutation = useMutation({
    mutationFn: (area: KnowledgeGapArea) => createKnowledgeGapNote(area.id, { topic: gapsQuery.data?.topic ?? activeTopic, area_name: area.name }),
    onSuccess: (note) => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      window.location.href = `/notes?note=${note.id}`;
    },
  });
  const coveragePercent = useMemo(() => {
    if (!gapsQuery.data) return 0;
    return Math.round(gapsQuery.data.coverage_ratio * 100);
  }, [gapsQuery.data]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void gapsQuery.refetch();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-normal tracking-normal">Knowledge gaps</h1>
        <p className="font-jetbrains mt-2 text-xs text-neutral-500">
          Compare a topic or collection against practical coverage rubrics.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Topic coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]" onSubmit={onSubmit}>
            <Select
              value={selectedTopic}
              onChange={(event) => {
                setSelectedTopic(event.target.value);
                setTopicInput("");
              }}
              disabled={!topics.length}
            >
              <option value="">{topics.length ? "Auto-select topic" : "No saved topics yet"}</option>
              {topics.map((topic) => (
                <option key={topic.name} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </Select>
            <Input
              value={topicInput}
              onChange={(event) => setTopicInput(event.target.value)}
              placeholder="Or type a topic to analyze..."
            />
            <Button type="submit" disabled={!activeTopic || gapsQuery.isFetching}>
              {gapsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Analyze
            </Button>
          </form>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px] md:items-center">
            <div className="relative">
              <Progress value={coveragePercent} indicatorClassName={coveragePercent > 60 ? "bg-neutral-200" : "bg-neutral-500"} />
              <span className="font-jetbrains absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white drop-shadow">
                {coveragePercent}%
              </span>
            </div>
            <div className="font-jetbrains text-sm text-neutral-300">covered</div>
          </div>
          {gapsQuery.data ? (
            <div className="rounded-md border border-white/10 bg-white/[0.025] p-3 text-sm text-neutral-300">
              <div className="font-medium text-white">{gapsQuery.data.why_detected}</div>
              <p className="mt-1 leading-6 text-neutral-500">{gapsQuery.data.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{gapsQuery.data.severity}</Badge>
                {gapsQuery.data.missing_source_types.map((sourceType) => <Badge key={sourceType}>{sourceType}</Badge>)}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {learningPathsQuery.data?.items.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Learning path progress</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningPathProgressList paths={learningPathsQuery.data.items} />
          </CardContent>
        </Card>
      ) : null}

      {weakAreasQuery.data?.items.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Quiz weak areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weakAreasQuery.data.items.map((area) => (
                <Badge key={area.name}>{area.name} x{area.count}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {overviewQuery.data?.items.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {overviewQuery.data.items.map((gap) => (
            <button
              key={gap.id}
              type="button"
              onClick={() => {
                setSelectedTopic(gap.topic);
                setTopicInput("");
              }}
              className="rounded-lg border border-white/10 bg-white/[0.025] p-4 text-left transition hover:border-white/25 hover:bg-white/[0.045]"
            >
              <div className="truncate text-sm font-medium text-white">{gap.topic}</div>
              <div className="font-jetbrains mt-2 text-xs text-neutral-500">{Math.round(gap.coverage_ratio * 100)}% covered / {gap.missing_count} missing</div>
            </button>
          ))}
        </section>
      ) : null}

      {topicsQuery.error || overviewQuery.error || gapsQuery.error ? (
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-neutral-300">
          {errorMessage(topicsQuery.error ?? overviewQuery.error ?? gapsQuery.error)}
        </div>
      ) : null}

      {gapsQuery.data ? (
        <section className="grid gap-4 md:grid-cols-2">
          {gapsQuery.data.areas.map((area) => (
            <Card key={area.name}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="min-w-0">{area.name}</CardTitle>
                <Badge>{area.covered ? "covered" : area.severity}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  {area.covered ? <Check className="h-4 w-4 text-neutral-200" /> : <X className="h-4 w-4 text-neutral-500" />}
                  {area.why_detected}
                </div>
                <p className="text-sm leading-6 text-neutral-500">{area.rationale}</p>
                {area.missing_source_types.length ? (
                  <div className="flex flex-wrap gap-2">
                    {area.missing_source_types.map((sourceType) => <Badge key={sourceType}>{sourceType}</Badge>)}
                  </div>
                ) : null}
                {area.evidence_titles.length ? (
                  <div className="grid gap-2">
                    {area.evidence_titles.map((title) => (
                      <div key={title} className="font-jetbrains rounded-md border border-white/10 bg-white/[0.02] p-2 text-xs text-neutral-400">
                        {title}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => createNoteMutation.mutate(area)} disabled={createNoteMutation.isPending}>
                    <FilePlus className="h-4 w-4" />
                    Create note
                  </Button>
                  <Link href={`/chat?topic=${encodeURIComponent(gapsQuery.data.topic)}&q=${encodeURIComponent(`What is missing about ${area.name}?`)}`} className="inline-flex h-8 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-neutral-100 hover:border-white/20 hover:bg-white/[0.08]">
                    <MessageSquareText className="h-4 w-4" />
                    Ask
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {!topicsQuery.isLoading && !topics.length && !topicInput.trim() && !gapsQuery.data ? (
        <EmptyState
          icon={<Gauge className="h-5 w-5" />}
          title="No saved topics yet"
          description="Type any topic above to run a coverage check, or ingest documents first so Conserium can suggest topics automatically."
        />
      ) : null}
    </div>
  );
}


function LearningPathProgressList({ paths }: { paths: LearningPath[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {paths.slice(0, 4).map((path) => {
        const done = path.steps.filter((step) => step.status === "done").length;
        const total = path.steps.length;
        const progress = total ? Math.round((done / total) * 100) : 0;
        return (
          <div key={path.id} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
            <div className="truncate text-sm font-medium text-white">{path.title}</div>
            <div className="font-jetbrains mt-1 text-xs text-neutral-500">{done}/{total} complete - {progress}%</div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
