import type { KnowledgeGapArea } from "./knowledge-gaps";
import type { ApiSchema } from "./generated";

export type SuggestedLearningResource = ApiSchema<"SuggestedLearningResourceResponse">;
export type RankedLearningResource = ApiSchema<"RankedLearningResourceResponse">;
export type LearningGoal = Omit<ApiSchema<"LearningGoalResponse">, "gaps"> & { gaps: KnowledgeGapArea[] };
export type LearningGoalRequest = ApiSchema<"LearningGoalRequest">;
export type LearningGoalUpdateRequest = ApiSchema<"LearningGoalUpdateRequest">;
