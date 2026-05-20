"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Gauge, Loader2, Search, X } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { getKnowledgeGaps, listTopics } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";

export default function KnowledgeGapsPage() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const topicsQuery = useQuery({ queryKey: ["topics", "knowledge-gaps"], queryFn: () => listTopics({ limit: 100 }) });
  const topics = topicsQuery.data?.items ?? [];
  const activeTopic = topicInput.trim() || selectedTopic || topics[0]?.name || "";
  const gapsQuery = useQuery({
    queryKey: ["knowledge-gaps", activeTopic],
    queryFn: () => getKnowledgeGaps(activeTopic),
    enabled: Boolean(activeTopic),
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
          Compare a topic against a practical coverage rubric.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Topic</CardTitle>
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
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px] md:items-center">
            <Progress value={coveragePercent} indicatorClassName={coveragePercent > 60 ? "bg-emerald-400" : "bg-yellow-400"} />
            <div className="font-jetbrains text-sm text-neutral-500">{coveragePercent}% covered</div>
          </div>
        </CardContent>
      </Card>

      {topicsQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(topicsQuery.error)}
        </div>
      ) : null}
      {gapsQuery.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage(gapsQuery.error)}
        </div>
      ) : null}

      {gapsQuery.data ? (
        <section className="grid gap-4 md:grid-cols-2">
          {gapsQuery.data.areas.map((area) => (
            <Card key={area.name}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="min-w-0">{area.name}</CardTitle>
                <Badge>{area.covered ? "covered" : "missing"}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  {area.covered ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-red-400" />}
                  {area.evidence_count} matching documents
                </div>
                {area.evidence_titles.length ? (
                  <div className="grid gap-2">
                    {area.evidence_titles.map((title) => (
                      <div key={title} className="font-jetbrains rounded-md border border-white/10 bg-white/[0.02] p-2 text-xs text-neutral-400">
                        {title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-neutral-500">
                    No matching saved material for this area.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {!topicsQuery.isLoading && !topics.length && !topicInput.trim() && !gapsQuery.data ? (
        <EmptyState
          icon={<Gauge className="h-5 w-5" />}
          title="No saved topics yet"
          description="Type any topic above to run a coverage check, or ingest documents first so Cortex can suggest topics automatically."
        />
      ) : null}
    </div>
  );
}
