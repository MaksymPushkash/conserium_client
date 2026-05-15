"use client";

import { FileText, Plus } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { NoteVersionHistory } from "@/components/notes/note-version-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NoteListItem, NoteVersion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NoteSidebarProps {
  notes: NoteListItem[];
  selectedId: string | null;
  notesLoading: boolean;
  createPending: boolean;
  versions: NoteVersion[];
  restorePending: boolean;
  onCreate: () => void;
  onSelect: (noteId: string) => void;
  onRestore: (versionId: string) => void;
}

export function NoteSidebar({
  notes,
  selectedId,
  notesLoading,
  createPending,
  versions,
  restorePending,
  onCreate,
  onSelect,
  onRestore,
}: NoteSidebarProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6">
        <Card className="border-white/10 bg-white/[0.015]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-normal text-white">Notes</CardTitle>
              <div className="font-jetbrains mt-1 text-xs font-light text-neutral-500">{notes.length} saved</div>
            </div>
            <Button size="icon" variant="secondary" onClick={onCreate} disabled={createPending} aria-label="Create note">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-[calc(100vh-180px)] space-y-2 overflow-auto">
              {notes.map((note) => (
                <NoteListButton key={note.id} note={note} active={note.id === selectedId} onSelect={onSelect} />
              ))}
              {!notes.length && !notesLoading ? (
                <div className="font-jetbrains rounded-lg border border-white/10 px-3 py-4 text-xs font-light leading-5 text-neutral-500">
                  Create a note. Saved text is indexed into memory after autosave.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card className="mt-4 border-white/10 bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <NoteVersionHistory versions={versions} restorePending={restorePending} onRestore={onRestore} />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

function NoteListButton({ note, active, onSelect }: { note: NoteListItem; active: boolean; onSelect: (noteId: string) => void }) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-colors",
        active ? "border-white/20 bg-white/[0.08]" : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.03]",
      )}
      onClick={() => onSelect(note.id)}
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
        <div className="truncate text-sm font-light text-white">{note.title}</div>
      </div>
      <div className="font-jetbrains mt-2 flex items-center justify-between gap-3 text-xs font-light text-neutral-500">
        <span>{note.word_count} words</span>
        <StatusPill status={note.status} />
      </div>
    </button>
  );
}
