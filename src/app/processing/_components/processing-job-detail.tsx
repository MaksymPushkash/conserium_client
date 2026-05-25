import { FileArchive, RefreshCw, RotateCcw } from "lucide-react";

import { ProcessingTimeline } from "@/components/documents/processing-timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SectionPanel } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";

import { reasonForStatus } from "./processing-job-helpers";
import { LinkButton } from "./processing-link-button";
import type { ProcessingJob } from "./processing-types";

export function ProcessingJobDetail({
  selectedJob,
  retryDocument,
  reprocessDocument,
  retryRepoSync,
  retryDocumentPending,
  reprocessPending,
  retryRepoPending,
}: {
  selectedJob: ProcessingJob | null;
  retryDocument: (id: string) => void;
  reprocessDocument: (id: string) => void;
  retryRepoSync: (id: string) => void;
  retryDocumentPending: boolean;
  reprocessPending: boolean;
  retryRepoPending: boolean;
}) {
  return (
    <SectionPanel
      title="Timeline"
      description={selectedJob ? selectedJob.title : "Select a job to inspect stages and errors."}
      actions={selectedJob ? <StatusBadge status={selectedJob.status} /> : null}
    >
      {selectedJob ? (
        <div className="grid gap-4">
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="font-jetbrains text-[11px] uppercase tracking-[0.18em] text-neutral-500">Reason</div>
            <div className={selectedJob.reason ? "mt-2 text-sm leading-6 text-red-200" : "mt-2 text-sm leading-6 text-neutral-400"}>
              {selectedJob.reason ?? reasonForStatus(selectedJob.status, selectedJob.kind)}
            </div>
          </div>

          {selectedJob.kind === "document" ? (
            <>
              <ProcessingTimeline status={selectedJob.statusDetail} />
              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {selectedJob.document?.status === "FAILED" ? (
                  <Button onClick={() => retryDocument(selectedJob.document!.id)} disabled={retryDocumentPending}>
                    <RotateCcw className="h-4 w-4" />
                    Retry failed job
                  </Button>
                ) : null}
                {selectedJob.document ? (
                  <>
                    <Button variant="secondary" onClick={() => reprocessDocument(selectedJob.document!.id)} disabled={reprocessPending}>
                      <RefreshCw className="h-4 w-4" />
                      Reprocess
                    </Button>
                    <LinkButton href={`/documents/${selectedJob.document.id}`} variant="secondary">
                      Open document
                    </LinkButton>
                  </>
                ) : null}
              </div>
            </>
          ) : null}

          {selectedJob.kind === "repo-sync" && selectedJob.repoSync ? (
            <div className="grid gap-3">
              <StageRow label="Repository" value={`${selectedJob.repoSync.owner}/${selectedJob.repoSync.repo}`} />
              <StageRow label="Branch" value={selectedJob.repoSync.branch} />
              <StageRow label="Last synced" value={formatDateTime(selectedJob.repoSync.last_synced_at)} />
              <Button onClick={() => retryRepoSync(selectedJob.repoSync!.id)} disabled={retryRepoPending}>
                <RefreshCw className="h-4 w-4" />
                Retry repo sync
              </Button>
            </div>
          ) : null}

          {selectedJob.kind === "export" ? (
            <div className="grid gap-4">
              <div className="text-sm leading-6 text-neutral-400">
                Exports currently run synchronously. Failed Notion exports surface on the export action that started them.
              </div>
              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <LinkButton href="/drafts" variant="secondary">
                  Open draft exports
                </LinkButton>
                <LinkButton href="/settings#integrations" variant="secondary">
                  Notion settings
                </LinkButton>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState icon={<FileArchive className="h-5 w-5" />} title="No job selected" description="Active or failed jobs will expose their retry actions and processing timeline here." />
      )}
    </SectionPanel>
  );
}

function StageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
      <span className="font-jetbrains text-xs uppercase tracking-[0.18em] text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-200">{value}</span>
    </div>
  );
}
