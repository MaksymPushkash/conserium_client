"use client";

import type { Flashcard, FlashcardGrade, FlashcardListResponse, GenerateFlashcardsPayload, GenerateFlashcardsResponse } from "@/lib/types";
import { request } from "./transport";

export function listDueFlashcards(limit = 20): Promise<FlashcardListResponse> {
  return request<FlashcardListResponse>(`/review/flashcards/due?limit=${limit}`);
}

export function generateFlashcards(payload: GenerateFlashcardsPayload): Promise<GenerateFlashcardsResponse> {
  return request<GenerateFlashcardsResponse>("/review/flashcards/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function reviewFlashcard(id: string, grade: FlashcardGrade): Promise<Flashcard> {
  return request<Flashcard>(`/review/flashcards/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ grade }),
  });
}
