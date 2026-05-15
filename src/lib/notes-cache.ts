import type { Note, NoteListItem, NoteListResponse } from "@/lib/types";

export function serializeNote(title: string, content: string): string {
  return `${title.trim() || "Untitled"}\n${content}`;
}

export function noteToListItem(note: Note): NoteListItem {
  return {
    id: note.id,
    title: note.title,
    collection_id: note.collection_id,
    status: note.status,
    word_count: note.word_count,
    language: note.language,
    created_at: note.created_at,
    updated_at: note.updated_at,
  };
}

export function upsertNoteList(old: NoteListResponse | undefined, note: Note): NoteListResponse {
  const item = noteToListItem(note);
  if (!old) {
    return { items: [item], total: 1, limit: 100, offset: 0 };
  }
  const exists = old.items.some((item) => item.id === note.id);
  return {
    ...old,
    items: exists ? old.items.map((oldItem) => (oldItem.id === note.id ? item : oldItem)) : [item, ...old.items],
    total: exists ? old.total : old.total + 1,
  };
}
