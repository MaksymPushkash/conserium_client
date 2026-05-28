"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NoteDeleteDialog } from "@/components/notes/note-delete-dialog";
import { NoteEditor } from "@/components/notes/note-editor";
import type { NoteEditorMode } from "@/components/notes/note-editor";
import { NoteSidebar } from "@/components/notes/note-sidebar";
import type { SlashRange } from "@/components/notes/slash-commands";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { useNoteAutosave } from "@/hooks/use-note-autosave";
import { useNoteEditor } from "@/hooks/use-note-editor";
import { useNoteImageUpload } from "@/hooks/use-note-image-upload";
import { useNoteMutations } from "@/hooks/use-note-mutations";
import { getNote, listCollections, listNoteVersions, listNotes } from "@/lib/api";
import { serializeNote } from "@/lib/notes-cache";
import { cn } from "@/lib/utils";

const AUTOSAVE_DELAY_MS = 1400;

export default function NotesPage() {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<NoteEditorMode>("edit");
  const [loadedNoteId, setLoadedNoteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const lastSavedRef = useRef("");
  const imageUploadStarterRef = useRef<(range: SlashRange) => void>(() => undefined);

  const collectionsQuery = useQuery({
    queryKey: ["collections"],
    queryFn: () => listCollections({ limit: 100 }),
  });

  const notesQuery = useQuery({
    queryKey: ["notes", { collectionId }],
    queryFn: () => listNotes({ limit: 200, collection_id: collectionId || null }),
  });

  const notes = useMemo(() => notesQuery.data?.items ?? [], [notesQuery.data?.items]);
  const selectedListItem = notes.find((note) => note.id === selectedId) ?? null;
  const selectedNoteQuery = useQuery({
    queryKey: ["notes", selectedId],
    queryFn: () => getNote(selectedId as string),
    enabled: Boolean(selectedId),
  });
  const selectedNote = selectedNoteQuery.data ?? null;
  const versionsQuery = useQuery({
    queryKey: ["notes", selectedId, "versions"],
    queryFn: () => listNoteVersions(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const { createMutation, updateMutation, restoreVersionMutation, deleteMutation } = useNoteMutations({
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
  });

  const noteEditor = useNoteEditor({
    content,
    setContent,
    onImageCommand: (range) => imageUploadStarterRef.current(range),
  });
  const noteImageUpload = useNoteImageUpload({ collectionId, insertTextAtRange: noteEditor.insertTextAtRange });
  imageUploadStarterRef.current = noteImageUpload.startImageUpload;
  const saveNote = useCallback(() => {
    updateMutation.mutate();
  }, [updateMutation.mutate]);

  useNoteAutosave({
    selectedId,
    loadedNoteId,
    title,
    content,
    pending: updateMutation.isPending,
    lastSavedRef,
    serialize: serializeNote,
    save: saveNote,
    delayMs: AUTOSAVE_DELAY_MS,
  });

  useEffect(() => {
    const requestedNoteId = searchParams.get("note");
    if (requestedNoteId && requestedNoteId !== selectedId) {
      setSelectedId(requestedNoteId);
      return;
    }
    if (!selectedId && notes.length) {
      setSelectedId(notes[0].id);
    }
  }, [notes, searchParams, selectedId]);

  useEffect(() => {
    setSelectedId(null);
    setLoadedNoteId(null);
    setTitle("");
    setContent("");
    lastSavedRef.current = "";
    setMode("edit");
  }, [collectionId]);

  useEffect(() => {
    if (!selectedNote || loadedNoteId === selectedNote.id) return;
    setLoadedNoteId(selectedNote.id);
    setTitle(selectedNote.title);
    setContent(selectedNote.content);
    lastSavedRef.current = serializeNote(selectedNote.title, selectedNote.content);
  }, [loadedNoteId, selectedNote]);

  const saveState = updateMutation.isPending
    ? "saving"
    : selectedListItem?.status === "READY"
      ? "indexed"
      : selectedListItem?.status.toLowerCase() || "draft";

  function confirmDeleteNote() {
    if (!selectedId) return;
    setDeleteConfirmOpen(true);
  }

  function deleteSelectedNote() {
    if (!selectedId) return;
    deleteMutation.mutate(selectedId);
    setDeleteConfirmOpen(false);
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid max-w-[1640px] gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <NoteSidebar
          notes={notes}
          selectedId={selectedId}
          notesLoading={notesQuery.isLoading}
          createPending={createMutation.isPending}
          versions={versionsQuery.data ?? []}
          restorePending={restoreVersionMutation.isPending}
          onCreate={() => createMutation.mutate()}
          onSelect={setSelectedId}
          onRestore={(versionId) => restoreVersionMutation.mutate(versionId)}
        />

        <section className="flex min-h-[calc(100vh-48px)] flex-col rounded-xl border border-white/10 bg-white/[0.015]">
          <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-normal tracking-normal text-white">Notes</h1>
              <div className="font-jetbrains mt-1 text-xs font-light text-neutral-500">
                {selectedNote ? `note ${selectedNote.id}` : "select or create a note"}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <select
                value={collectionId}
                onChange={(event) => setCollectionId(event.target.value)}
                className="h-9 rounded-md border border-white/10 bg-black px-3 text-sm font-light text-white outline-none"
                disabled={collectionsQuery.isLoading}
                aria-label="Collection"
              >
                <option value="">All collections</option>
                {collectionsQuery.data?.items.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="font-normal xl:hidden"
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
              {selectedId ? (
                <div className="flex h-9 rounded-md border border-white/10 bg-white/[0.03] p-1">
                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={cn(
                      "rounded px-3 text-xs font-light transition-colors",
                      mode === "edit" ? "bg-white text-black" : "text-neutral-500 hover:text-white",
                    )}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("preview")}
                    className={cn(
                      "rounded px-3 text-xs font-light transition-colors",
                      mode === "preview" ? "bg-white text-black" : "text-neutral-500 hover:text-white",
                    )}
                  >
                    Preview
                  </button>
                </div>
              ) : null}
              {selectedListItem ? (
                <span className="inline-flex h-9 items-center">
                  <StatusPill status={selectedListItem.status} />
                </span>
              ) : null}
              <span className="font-jetbrains inline-flex h-9 items-center text-xs font-light text-neutral-500">{saveState}</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-600 hover:text-red-400"
                onClick={confirmDeleteNote}
                disabled={!selectedId || deleteMutation.isPending}
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto px-5 py-8">
            <NoteEditor
              selected={Boolean(selectedId)}
              title={title}
              content={content}
              mode={mode}
              textareaRef={noteEditor.textareaRef}
              imageInputRef={noteImageUpload.imageInputRef}
              slashRange={noteEditor.slashRange}
              slashIndex={noteEditor.slashIndex}
              slashCommands={noteEditor.filteredSlashCommands}
              onTitleChange={setTitle}
              onContentChange={noteEditor.onContentChange}
              onContentKeyDown={noteEditor.onContentKeyDown}
              onImageInputChange={noteImageUpload.onImageInputChange}
              onRunSlashCommand={noteEditor.runSlashCommand}
              emptyState={
                <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-24 text-center">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                    <FileText className="h-4 w-4 text-neutral-300" />
                  </div>
                  <h2 className="text-4xl font-light tracking-normal text-white">Write into memory.</h2>
                  <p className="font-jetbrains mt-4 max-w-xl text-sm font-light leading-6 text-neutral-500">
                    Create plain text notes. Conserium autosaves them, indexes them, and makes them available in chat retrieval.
                  </p>
                  <Button className="mt-8 font-normal" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                    <Plus className="h-4 w-4" />
                    Create note
                  </Button>
                </div>
              }
            />
          </div>
        </section>
      </div>
      {deleteConfirmOpen ? (
        <NoteDeleteDialog
          title={title}
          pending={deleteMutation.isPending}
          onCancel={() => setDeleteConfirmOpen(false)}
          onDelete={deleteSelectedNote}
        />
      ) : null}
    </div>
  );
}
