"use client";

import type { Note, NoteListResponse, NoteVersion } from "@/lib/types";
import { request } from "./transport";

export function listNotes(params: { limit?: number; offset?: number; collection_id?: string | null } = {}): Promise<NoteListResponse> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  if (params.collection_id) search.set("collection_id", params.collection_id);
  const query = search.toString();
  return request<NoteListResponse>(`/notes${query ? `?${query}` : ""}`);
}

export function createNote(payload: { title?: string | null; content?: string | null; collection_id?: string | null; language?: string | null }): Promise<Note> {
  return request<Note>("/notes", { method: "POST", body: JSON.stringify(payload) });
}

export function getNote(id: string): Promise<Note> {
  return request<Note>(`/notes/${id}`);
}

export function updateNote(id: string, payload: { title?: string; content?: string; collection_id?: string | null; language?: string | null }): Promise<Note> {
  return request<Note>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteNote(id: string): Promise<void> {
  return request<void>(`/notes/${id}`, { method: "DELETE" });
}

export function listNoteVersions(id: string): Promise<NoteVersion[]> {
  return request<NoteVersion[]>(`/notes/${id}/versions`);
}

export function restoreNoteVersion(noteId: string, versionId: string): Promise<Note> {
  return request<Note>(`/notes/${noteId}/versions/${versionId}/restore`, { method: "POST" });
}
