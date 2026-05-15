"use client";

import type { NoteVersion } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface NoteVersionHistoryProps {
  versions: NoteVersion[];
  restorePending: boolean;
  onRestore: (versionId: string) => void;
}

export function NoteVersionHistory({ versions, restorePending, onRestore }: NoteVersionHistoryProps) {
  return versions.length ? (
    versions.map((version) => (
      <button
        key={version.id}
        type="button"
        className="w-full rounded-lg border border-white/10 px-3 py-2 text-left transition-colors hover:border-white/20 hover:bg-white/[0.03]"
        onClick={() => onRestore(version.id)}
        disabled={restorePending}
      >
        <div className="text-sm font-light text-white">Version {version.version_number}</div>
        <div className="font-jetbrains mt-1 text-xs font-light text-neutral-500">{formatDateTime(version.created_at)}</div>
      </button>
    ))
  ) : (
    <div className="font-jetbrains rounded-lg border border-white/10 px-3 py-4 text-xs font-light leading-5 text-neutral-500">
      Versions appear after edits are saved.
    </div>
  );
}
