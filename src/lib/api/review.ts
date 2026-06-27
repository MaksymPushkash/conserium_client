"use client";

import type {
  Flashcard,
  FlashcardGrade,
  FlashcardListResponse,
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  GenerateLearningPathRequest,
  GenerateQuizRequest,
  LearningPath,
  LearningPathListResponse,
  Quiz,
  QuizAttempt,
  QuizAttemptListResponse,
  QuizListResponse,
  QuizWeakAreaListResponse,
  SubmitQuizAnswer,
} from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listDueFlashcards(limit = 20): Promise<FlashcardListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/review/flashcards/due", { params: { query: { limit } } }),
  );
}

export async function generateFlashcards(payload: GenerateFlashcardsRequest): Promise<GenerateFlashcardsResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/review/flashcards/generate", { body: { ...payload, limit: payload.limit ?? 5 } }),
  );
}

export async function reviewFlashcard(id: string, grade: FlashcardGrade): Promise<Flashcard> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/review/flashcards/{flashcard_id}/review", {
      params: { path: { flashcard_id: id } },
      body: { grade },
    }),
  );
}

export async function generateQuiz(payload: GenerateQuizRequest): Promise<Quiz> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/review/quizzes/generate", { body: { ...payload, limit: payload.limit ?? 5 } }),
  );
}

export async function submitQuiz(id: string, answers: SubmitQuizAnswer[]): Promise<QuizAttempt> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/review/quizzes/{quiz_id}/submit", {
      params: { path: { quiz_id: id } },
      body: { answers },
    }),
  );
}

export async function listQuizHistory(limit = 10): Promise<QuizListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/review/quizzes/history", { params: { query: { limit } } }),
  );
}

export async function listQuizAttempts(limit = 10): Promise<QuizAttemptListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/review/quizzes/attempts", { params: { query: { limit } } }),
  );
}

export async function listQuizWeakAreas(limit = 10): Promise<QuizWeakAreaListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/review/quizzes/weak-areas", { params: { query: { limit } } }),
  );
}

export async function generateLearningPath(payload: GenerateLearningPathRequest): Promise<LearningPath> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/review/learning-paths/generate", { body: { ...payload, limit: payload.limit ?? 6 } }),
  );
}

export async function listLearningPaths(limit = 10): Promise<LearningPathListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/review/learning-paths", { params: { query: { limit } } }),
  );
}

export async function updateLearningPathStep(
  pathId: string,
  stepId: string,
  status: "todo" | "done",
): Promise<LearningPath> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/review/learning-paths/{path_id}/steps/{step_id}", {
      params: { path: { path_id: pathId, step_id: stepId } },
      body: { status },
    }),
  );
}

export async function regenerateLearningPath(pathId: string, limit = 6): Promise<LearningPath> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/review/learning-paths/{path_id}/regenerate", {
      params: { path: { path_id: pathId }, query: { limit } },
    }),
  );
}
