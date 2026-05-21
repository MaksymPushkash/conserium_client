import { StatusBadge } from "@/components/ui/status-badge";
import type { DocumentStatus } from "@/lib/types";

export function StatusPill({ status }: { status: DocumentStatus | string }) {
  return <StatusBadge status={status} />;
}
