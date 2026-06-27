"use client";

import type { Note, NoteListResponse, NoteVersion } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listNotes(
  params: { limit?: number; offset?: number; collection_id?: string | null } = {},
): Promise<NoteListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/notes", { params: { query: params } }));
}

export async function createNote(payload: {
  title?: string | null;
  content?: string | null;
  collection_id?: string | null;
  language?: string | null;
}): Promise<Note> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/notes", { body: noteBody(payload) }));
}

export async function getNote(id: string): Promise<Note> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/notes/{note_id}", { params: { path: { note_id: id } } }));
}

export async function updateNote(
  id: string,
  payload: { title?: string; content?: string; collection_id?: string | null; language?: string | null },
): Promise<Note> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/notes/{note_id}", {
      params: { path: { note_id: id } },
      body: noteBody(payload),
    }),
  );
}

export async function deleteNote(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/notes/{note_id}", { params: { path: { note_id: id } } }),
  );
}

export async function listNoteVersions(id: string): Promise<NoteVersion[]> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/notes/{note_id}/versions", { params: { path: { note_id: id } } }),
  );
}

export async function restoreNoteVersion(noteId: string, versionId: string): Promise<Note> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/notes/{note_id}/versions/{version_id}/restore", {
      params: { path: { note_id: noteId, version_id: versionId } },
    }),
  );
}

function noteBody(payload: {
  title?: string | null;
  content?: string | null;
  collection_id?: string | null;
  language?: string | null;
}) {
  return {
    title: payload.title ?? "",
    content: payload.content ?? "",
    collection_id: payload.collection_id,
    language: payload.language,
  };
}
