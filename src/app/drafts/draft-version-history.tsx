import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionPanel } from "@/components/ui/page-shell";

import type { useDraftWorkflow } from "./use-draft-workflow";

type DraftWorkflow = ReturnType<typeof useDraftWorkflow>;

export function DraftVersionHistory({
  activeVersionId,
  history,
  versions,
  restoreMutation,
  restoreHistory,
  restoreVersion,
}: Pick<DraftWorkflow, "history" | "versions" | "restoreMutation" | "restoreHistory" | "restoreVersion"> & { activeVersionId: string | null }) {
  return (
    <SectionPanel title="Version history" description="Recent generated drafts and server versions.">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="grid content-start gap-2">
          {history.length ? (
            history.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => restoreHistory(item)}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.055]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-white">{item.title}</span>
                  <span className="font-jetbrains text-xs text-neutral-500">{new Date(item.created_at).toLocaleString()}</span>
                </span>
                <RotateCcw className="h-4 w-4 text-neutral-400" />
              </button>
            ))
          ) : (
            <p className="font-jetbrains text-sm text-neutral-500">No generated drafts yet.</p>
          )}
        </div>
        <div className="grid content-start gap-2">
          {versions.length ? (
            versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
                <span className="min-w-0">
                  <span className="block text-sm text-white">Version {version.version_number}</span>
                  <span className="font-jetbrains text-xs text-neutral-500">{new Date(version.created_at).toLocaleString()}</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => restoreVersion(version.id)}
                  disabled={restoreMutation.isPending || version.id === activeVersionId}
                >
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
              </div>
            ))
          ) : (
            <p className="font-jetbrains text-sm text-neutral-500">No server versions selected.</p>
          )}
        </div>
      </div>
    </SectionPanel>
  );
}
