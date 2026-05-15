"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MutableRefObject } from "react";

import { createNote, deleteNote, restoreNoteVersion, updateNote } from "@/lib/api";
import { serializeNote, upsertNoteList } from "@/lib/notes-cache";
import type { Note, NoteListResponse } from "@/lib/types";

interface UseNoteMutationsOptions {
  collectionId: string;
  selectedId: string | null;
  selectedNote: Note | null;
  title: string;
  content: string;
  lastSavedRef: MutableRefObject<string>;
  setSelectedId: (id: string | null) => void;
  setLoadedNoteId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
}

export function useNoteMutations({
  collectionId,
  selectedId,
  selectedNote,
  title,
  content,
  lastSavedRef,
  setSelectedId,
  setLoadedNoteId,
  setTitle,
  setContent,
}: UseNoteMutationsOptions) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createNote({ title: "Untitled", content: "", collection_id: collectionId || null }),
    onSuccess: (note) => {
      queryClient.setQueryData<NoteListResponse>(["notes", { collectionId }], (old) => upsertNoteList(old, note));
      queryClient.setQueryData(["notes", note.id], note);
      setSelectedId(note.id);
      setLoadedNoteId(note.id);
      setTitle(note.title);
      setContent(note.content);
      lastSavedRef.current = serializeNote(note.title, note.content);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedId) throw new Error("Select a note first");
      return updateNote(selectedId, {
        title: title.trim() || "Untitled",
        content,
        collection_id: selectedNote?.collection_id ?? (collectionId || null),
        language: null,
      });
    },
    onSuccess: (note) => {
      queryClient.setQueryData<NoteListResponse>(["notes", { collectionId }], (old) => upsertNoteList(old, note));
      queryClient.setQueryData(["notes", note.id], note);
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["notes", note.id, "versions"] });
      lastSavedRef.current = serializeNote(note.title, note.content);
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) => {
      if (!selectedId) throw new Error("Select a note first");
      return restoreNoteVersion(selectedId, versionId);
    },
    onSuccess: (note) => {
      queryClient.setQueryData<NoteListResponse>(["notes", { collectionId }], (old) => upsertNoteList(old, note));
      queryClient.setQueryData(["notes", note.id], note);
      setTitle(note.title);
      setContent(note.content);
      lastSavedRef.current = serializeNote(note.title, note.content);
      void queryClient.invalidateQueries({ queryKey: ["notes", note.id, "versions"] });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<NoteListResponse>(["notes", { collectionId }], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((note) => note.id !== deletedId),
          total: Math.max(0, old.total - 1),
        };
      });
      if (selectedId === deletedId) {
        setSelectedId(null);
        setLoadedNoteId(null);
        setTitle("");
        setContent("");
        lastSavedRef.current = "";
      }
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return {
    createMutation,
    updateMutation,
    restoreVersionMutation,
    deleteMutation,
  };
}
