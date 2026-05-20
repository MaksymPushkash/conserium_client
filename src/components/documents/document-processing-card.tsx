import { ProcessingTimeline } from "@/components/documents/processing-timeline";
import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DocumentStatusResponse } from "@/lib/types";

interface DocumentProcessingCardProps {
  status: DocumentStatusResponse | undefined;
  visibleStatus: string;
}

export function DocumentProcessingCard({ status, visibleStatus }: DocumentProcessingCardProps) {
  const message = visibleStatus === "READY" ? null : (status?.message ?? "No worker status yet.");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <StatusPill status={visibleStatus} />
            <span className="font-jetbrains text-xs text-neutral-500">{status?.progress ?? 0}%</span>
          </div>
          <Progress value={status?.progress ?? 0} />
          {message ? <div className="text-neutral-400">{message}</div> : null}
        </div>
        <ProcessingTimeline status={status} />
      </CardContent>
    </Card>
  );
}
