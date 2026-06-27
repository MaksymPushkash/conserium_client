import type { LearningGoal, LearningGoalRequest, LearningGoalUpdateRequest, RankedLearningResource } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listLearningGoals(): Promise<LearningGoal[]> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/learning-goals"));
}

export async function listLearningGoalReminders(): Promise<LearningGoal[]> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/learning-goals/reminders"));
}

export async function listLearningGoalResources(
  id: string,
  params: { refresh?: boolean } = {},
): Promise<RankedLearningResource[]> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/learning-goals/{goal_id}/resources", {
      params: { path: { goal_id: id }, query: params },
    }),
  );
}

export async function createLearningGoal(payload: LearningGoalRequest): Promise<LearningGoal> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/learning-goals", { body: payload }));
}

export async function updateLearningGoal(id: string, payload: LearningGoalUpdateRequest): Promise<LearningGoal> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/learning-goals/{goal_id}", {
      params: { path: { goal_id: id } },
      body: payload,
    }),
  );
}

export async function deleteLearningGoal(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/learning-goals/{goal_id}", { params: { path: { goal_id: id } } }),
  );
}
