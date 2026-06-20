import type { ApiSchema } from "./generated";

export type FlashcardGrade = "again" | "hard" | "good" | "easy";

export type Flashcard = ApiSchema<"FlashcardResponse">;
export type FlashcardListResponse = ApiSchema<"FlashcardListResponse">;
export type GenerateFlashcardsPayload = ApiSchema<"GenerateFlashcardsRequest">;
export type GenerateFlashcardsResponse = ApiSchema<"GenerateFlashcardsResponse">;


export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correct_option_id: string;
  explanation: string;
  weak_area: string;
  source_document_id?: string;
  source_title?: string;
}

export type Quiz = Omit<ApiSchema<"QuizResponse">, "questions"> & { questions: QuizQuestion[] };
export type GenerateQuizPayload = ApiSchema<"GenerateQuizRequest">;

export interface SubmitQuizAnswer {
  question_id: string;
  option_id: string;
}

export type QuizAttempt = Omit<ApiSchema<"QuizAttemptResponse">, "answers"> & {
  answers: Array<SubmitQuizAnswer & { correct: boolean; correct_option_id: string; weak_area?: string }>;
};
export type QuizListResponse = Omit<ApiSchema<"QuizListResponse">, "items"> & { items: Quiz[] };
export type QuizAttemptListResponse = Omit<ApiSchema<"QuizAttemptListResponse">, "items"> & {
  items: QuizAttempt[];
};
export type QuizWeakArea = ApiSchema<"QuizWeakAreaResponse">;
export type QuizWeakAreaListResponse = ApiSchema<"QuizWeakAreaListResponse">;


export interface LearningPathStep {
  id: string;
  title: string;
  focus: string;
  summary: string;
  source_document_id?: string;
  status: string;
}

export type LearningPath = Omit<ApiSchema<"LearningPathResponse">, "steps"> & { steps: LearningPathStep[] };
export type GenerateLearningPathPayload = ApiSchema<"GenerateLearningPathRequest">;
export type LearningPathListResponse = Omit<ApiSchema<"LearningPathListResponse">, "items"> & {
  items: LearningPath[];
};
