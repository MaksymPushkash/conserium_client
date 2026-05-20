import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  READY: "border-transparent bg-transparent px-0 text-emerald-400",
  FAILED: "text-red-400",
  PROCESSING: "border-white/15 bg-white/[0.04] text-neutral-300",
  QUEUED: "border-white/15 bg-white/[0.04] text-neutral-400",
  PENDING: "border-white/10 bg-white/[0.025] text-neutral-500",
};

export function StatusPill({ status }: { status: DocumentStatus | string }) {
  return (
    <Badge className={cn("font-jetbrains uppercase shadow-none", styles[status] ?? styles.PENDING)}>
      {status}
    </Badge>
  );
}
