import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  READY: "border-white/20 bg-white/[0.06] text-neutral-200",
  SUCCESS: "border-white/20 bg-white/[0.06] text-neutral-200",
  COMPLETE: "border-white/20 bg-white/[0.06] text-neutral-200",
  COVERED: "border-white/20 bg-white/[0.06] text-neutral-200",
  PROCESSING: "border-white/20 bg-white/[0.06] text-neutral-200",
  RUNNING: "border-white/20 bg-white/[0.06] text-neutral-200",
  QUEUED: "border-white/16 bg-white/[0.05] text-neutral-300",
  PENDING: "border-white/16 bg-white/[0.04] text-neutral-300",
  DRAFT: "border-white/12 bg-white/[0.04] text-neutral-300",
  MISSING: "border-white/16 bg-white/[0.04] text-neutral-300",
  WARNING: "border-white/16 bg-white/[0.04] text-neutral-300",
  HOT: "border-white/20 bg-white/[0.07] text-neutral-100",
  COLD: "border-white/16 bg-white/[0.04] text-neutral-300",
  FAILED: "border-white/16 bg-white/[0.04] text-neutral-300",
  ERROR: "border-white/16 bg-white/[0.04] text-neutral-300",
};

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const key = status.toUpperCase();
  return (
    <Badge className={cn("font-jetbrains uppercase tracking-[0.12em]", statusStyles[key] ?? statusStyles.DRAFT, className)}>
      {label ?? status}
    </Badge>
  );
}
