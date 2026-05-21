"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import { createLearningGoal, deleteLearningGoal, listLearningGoalResources, listLearningGoals, updateLearningGoal } from "@/lib/api";

export function useLearningGoalsWorkflow() {
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      topic,
      description: description || null,
      target_date: targetDate || null,
    });
  }

  return {
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
    submit,
  };
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
