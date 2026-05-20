import { Download, Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface DocumentActionsProps {
  documentId: string;
  failed: boolean;
  retryPending: boolean;
  reprocessPending: boolean;
  deletePending: boolean;
  exportPending: boolean;
  onRetry: (documentId: string) => void;
  onReprocess: (documentId: string) => void;
  onDelete: () => void;
  onRename: () => void;
  onExport: (format: "markdown" | "pdf") => void;
}

export function DocumentActions({
  documentId,
  failed,
  retryPending,
  reprocessPending,
  deletePending,
  exportPending,
  onRetry,
  onReprocess,
  onDelete,
  onRename,
  onExport,
}: DocumentActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/documents">
        <Button className="h-9 px-4 text-sm">Back to library</Button>
      </Link>
      {failed ? (
        <Button variant="secondary" onClick={() => onRetry(documentId)} disabled={retryPending}>
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
      ) : null}
      <Button variant="secondary" onClick={() => onReprocess(documentId)} disabled={reprocessPending}>
        <RotateCcw className="h-4 w-4" />
        Reprocess
      </Button>
      <Button variant="danger" onClick={onDelete} disabled={deletePending}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <Button variant="secondary" onClick={onRename}>
        <Pencil className="h-4 w-4" />
        Rename
      </Button>
      <Button variant="secondary" onClick={() => onExport("markdown")} disabled={exportPending}>
        <Download className="h-4 w-4" />
        MD
      </Button>
      <Button variant="secondary" onClick={() => onExport("pdf")} disabled={exportPending}>
        <Download className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
