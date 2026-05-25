import type { DocumentStatus } from "./documents";

export interface Note {
  id: string;
  collection_id: string | null;
  title: string;
  content: string;
  status: DocumentStatus;
  word_count: number;
  language: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
}

export type NoteListItem = Omit<Note, "content">;

export interface NoteListResponse {
  items: NoteListItem[];
  total: number;
  limit: number;
  offset: number;
}
