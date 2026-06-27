import type { ApiSchema } from "./generated";

export type FlashcardGrade = "again" | "hard" | "good" | "easy";

export type Flashcard = ApiSchema<"FlashcardResponse">;
export type FlashcardListResponse = ApiSchema<"FlashcardListResponse">;
export type GenerateFlashcardsRequest = ApiSchema<"GenerateFlashcardsRequest">;
export type GenerateFlashcardsResponse = ApiSchema<"GenerateFlashcardsResponse">;

export type QuizOption = ApiSchema<"QuizOptionResponse">;
export type QuizQuestion = ApiSchema<"QuizQuestionResponse">;
export type Quiz = ApiSchema<"QuizResponse">;
export type GenerateQuizRequest = ApiSchema<"GenerateQuizRequest">;
export type SubmitQuizAnswer = ApiSchema<"SubmitQuizAnswerRequest">;
export type QuizAttempt = ApiSchema<"QuizAttemptResponse">;
export type QuizListResponse = ApiSchema<"QuizListResponse">;
export type QuizAttemptListResponse = ApiSchema<"QuizAttemptListResponse">;
export type QuizWeakArea = ApiSchema<"QuizWeakAreaResponse">;
export type QuizWeakAreaListResponse = ApiSchema<"QuizWeakAreaListResponse">;

export type LearningPathStep = ApiSchema<"LearningPathStepResponse">;
export type LearningPath = ApiSchema<"LearningPathResponse">;
export type GenerateLearningPathRequest = ApiSchema<"GenerateLearningPathRequest">;
export type LearningPathListResponse = ApiSchema<"LearningPathListResponse">;
