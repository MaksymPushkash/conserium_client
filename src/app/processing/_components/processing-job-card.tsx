import { ArrowRight, FileArchive, FileText, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatDateTime } from "@/lib/utils";

import type { JobKind, ProcessingJob } from "./processing-types";

export function JobCard({
  job,
  selected,
  onSelect,
  onRetry,
  retryPending,
}: {
  job: ProcessingJob;
  selected: boolean;
  onSelect: () => void;
  onRetry: () => void;
  retryPending: boolean;
}) {
  const Icon = jobIcon(job.kind);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Select ${job.title}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "cursor-pointer",
        "grid gap-3 rounded-lg border p-4 text-left transition md:grid-cols-[1fr_auto]",
        selected ? "border-white/30 bg-white/[0.065]" : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.055]",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <Icon className="h-4 w-4 text-neutral-400" />
          <h2 className="truncate text-base font-medium text-white">{job.title}</h2>
          <StatusBadge status={job.status} />
        </div>
        <div className="font-jetbrains mt-2 text-xs text-neutral-500">{job.subtitle} / {job.updatedAt ? formatDateTime(job.updatedAt) : "no active run"}</div>
        {job.reason ? <div className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-300">{job.reason}</div> : null}
      </div>
      <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
        {job.state === "failed" ? (
          <Button
            type="button"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onRetry();
            }}
            disabled={retryPending}
          >
            Retry
          </Button>
        ) : null}
        <ArrowRight className="h-4 w-4 text-neutral-500" />
      </div>
    </div>
  );
}

function jobIcon(kind: JobKind) {
  if (kind === "repo-sync") return UploadCloud;
  if (kind === "export") return FileArchive;
  return FileText;
}
