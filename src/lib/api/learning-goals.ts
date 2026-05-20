import type { LearningGoal, LearningGoalRequest, LearningGoalUpdateRequest, RankedLearningResource } from "@/lib/types";
import { request } from "./transport";

export function listLearningGoals(): Promise<LearningGoal[]> {
  return request<LearningGoal[]>("/learning-goals");
}

export function listLearningGoalReminders(): Promise<LearningGoal[]> {
  return request<LearningGoal[]>("/learning-goals/reminders");
}

export function listLearningGoalResources(id: string, params: { refresh?: boolean } = {}): Promise<RankedLearningResource[]> {
  const query = params.refresh ? "?refresh=true" : "";
  return request<RankedLearningResource[]>(`/learning-goals/${id}/resources${query}`);
}

export function createLearningGoal(payload: LearningGoalRequest): Promise<LearningGoal> {
  return request<LearningGoal>("/learning-goals", { method: "POST", body: JSON.stringify(payload) });
}

export function updateLearningGoal(id: string, payload: LearningGoalUpdateRequest): Promise<LearningGoal> {
  return request<LearningGoal>(`/learning-goals/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteLearningGoal(id: string): Promise<void> {
  return request<void>(`/learning-goals/${id}`, { method: "DELETE" });
}
