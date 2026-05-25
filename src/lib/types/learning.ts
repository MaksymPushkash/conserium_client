import type { KnowledgeGapArea } from "./knowledge-gaps";

export interface LearningGoal {
  id: string;
  user_id: string;
  topic: string;
  description: string | null;
  target_date: string | null;
  status: "active" | "paused" | "completed" | string;
  progress_ratio: number;
  covered_count: number;
  missing_count: number;
  gaps: KnowledgeGapArea[];
  recommended_next_areas: string[];
  suggested_resources: SuggestedLearningResource[];
  deadline_status: "none" | "upcoming" | "due_soon" | "overdue" | "completed" | string;
  days_remaining: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface SuggestedLearningResource {
  area: string;
  title: string;
  search_query: string;
  reason: string;
  url: string | null;
}

export interface RankedLearningResource extends SuggestedLearningResource {
  excerpt: string | null;
  score: number;
  warning?: string | null;
  cached: boolean;
  refreshed_at: string | null;
}

export interface LearningGoalRequest {
  topic: string;
  description?: string | null;
  target_date?: string | null;
}

export interface LearningGoalUpdateRequest {
  topic?: string | null;
  description?: string | null;
  target_date?: string | null;
  status?: "active" | "paused" | "completed" | null;
}
