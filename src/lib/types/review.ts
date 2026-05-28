export type FlashcardGrade = "again" | "hard" | "good" | "easy";

export interface Flashcard {
  id: string;
  user_id: string;
  scope_type: string;
  collection_id: string | null;
  topic: string | null;
  source_document_id: string | null;
  source_chunk_id: string | null;
  question: string;
  answer: string;
  citation_metadata: Record<string, unknown>;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  source_title: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface FlashcardListResponse {
  items: Flashcard[];
  total: number;
  limit: number;
}

export interface GenerateFlashcardsPayload {
  document_id?: string | null;
  collection_id?: string | null;
  topic?: string | null;
  limit?: number;
}

export interface GenerateFlashcardsResponse {
  items: Flashcard[];
  created_count: number;
}
