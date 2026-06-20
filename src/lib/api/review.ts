"use client";

import type {
  Flashcard,
  FlashcardGrade,
  FlashcardListResponse,
  GenerateFlashcardsPayload,
  GenerateFlashcardsResponse,
  GenerateLearningPathPayload,
  GenerateQuizPayload,
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
import {
  normalizeFlashcard,
  normalizeFlashcardList,
  normalizeGenerateFlashcards,
  normalizeLearningPath,
  normalizeLearningPathList,
  normalizeQuiz,
  normalizeQuizAttempt,
  normalizeQuizAttemptList,
  normalizeQuizList,
} from "./generated/normalizers";

export async function listDueFlashcards(limit = 20): Promise<FlashcardListResponse> {
  return normalizeFlashcardList(unwrapApiResponse(
    await apiClient.GET("/api/v1/review/flashcards/due", { params: { query: { limit } } }),
  ));
}

export async function generateFlashcards(payload: GenerateFlashcardsPayload): Promise<GenerateFlashcardsResponse> {
  return normalizeGenerateFlashcards(unwrapApiResponse(
    await apiClient.POST("/api/v1/review/flashcards/generate", { body: { ...payload, limit: payload.limit ?? 5 } }),
  ));
}

export async function reviewFlashcard(id: string, grade: FlashcardGrade): Promise<Flashcard> {
  return normalizeFlashcard(unwrapApiResponse(
    await apiClient.POST("/api/v1/review/flashcards/{flashcard_id}/review", {
      params: { path: { flashcard_id: id } },
      body: { grade },
    }),
  ));
}

export async function generateQuiz(payload: GenerateQuizPayload): Promise<Quiz> {
  return normalizeQuiz(unwrapApiResponse(
    await apiClient.POST("/api/v1/review/quizzes/generate", { body: { ...payload, limit: payload.limit ?? 5 } }),
  ));
}

export async function submitQuiz(id: string, answers: SubmitQuizAnswer[]): Promise<QuizAttempt> {
  const requestAnswers: Record<string, unknown>[] = answers.map((answer) => ({
    question_id: answer.question_id,
    option_id: answer.option_id,
  }));
  return normalizeQuizAttempt(unwrapApiResponse(
    await apiClient.POST("/api/v1/review/quizzes/{quiz_id}/submit", {
      params: { path: { quiz_id: id } },
      body: { answers: requestAnswers },
    }),
  ));
}

export async function listQuizHistory(limit = 10): Promise<QuizListResponse> {
  return normalizeQuizList(unwrapApiResponse(
    await apiClient.GET("/api/v1/review/quizzes/history", { params: { query: { limit } } }),
  ));
}

export async function listQuizAttempts(limit = 10): Promise<QuizAttemptListResponse> {
  return normalizeQuizAttemptList(unwrapApiResponse(
    await apiClient.GET("/api/v1/review/quizzes/attempts", { params: { query: { limit } } }),
  ));
}

export async function listQuizWeakAreas(limit = 10): Promise<QuizWeakAreaListResponse> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/review/quizzes/weak-areas", { params: { query: { limit } } }),
  );
}

export async function generateLearningPath(payload: GenerateLearningPathPayload): Promise<LearningPath> {
  return normalizeLearningPath(unwrapApiResponse(
    await apiClient.POST("/api/v1/review/learning-paths/generate", { body: { ...payload, limit: payload.limit ?? 6 } }),
  ));
}

export async function listLearningPaths(limit = 10): Promise<LearningPathListResponse> {
  return normalizeLearningPathList(unwrapApiResponse(
    await apiClient.GET("/api/v1/review/learning-paths", { params: { query: { limit } } }),
  ));
}

export async function updateLearningPathStep(
  pathId: string,
  stepId: string,
  status: "todo" | "done",
): Promise<LearningPath> {
  return normalizeLearningPath(unwrapApiResponse(
    await apiClient.PATCH("/api/v1/review/learning-paths/{path_id}/steps/{step_id}", {
      params: { path: { path_id: pathId, step_id: stepId } },
      body: { status },
    }),
  ));
}

export async function regenerateLearningPath(pathId: string, limit = 6): Promise<LearningPath> {
  return normalizeLearningPath(unwrapApiResponse(
    await apiClient.POST("/api/v1/review/learning-paths/{path_id}/regenerate", {
      params: { path: { path_id: pathId }, query: { limit } },
    }),
  ));
}
