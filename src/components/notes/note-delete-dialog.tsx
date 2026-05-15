"use client";

import { Button } from "@/components/ui/button";

interface NoteDeleteDialogProps {
  title: string;
  pending: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export function NoteDeleteDialog({ title, pending, onCancel, onDelete }: NoteDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Delete note">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-black p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <h2 className="text-lg font-normal text-white">Delete note</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-400">Delete "{title.trim() || "Untitled"}" permanently?</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={pending}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
