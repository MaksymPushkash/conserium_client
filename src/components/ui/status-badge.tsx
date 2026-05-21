import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  READY: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  SUCCESS: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  COMPLETE: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  COVERED: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  PROCESSING: "border-white/20 bg-white/[0.06] text-neutral-200",
  RUNNING: "border-white/20 bg-white/[0.06] text-neutral-200",
  QUEUED: "border-white/16 bg-white/[0.05] text-neutral-300",
  PENDING: "border-white/16 bg-white/[0.04] text-neutral-300",
  DRAFT: "border-white/12 bg-white/[0.04] text-neutral-300",
  MISSING: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  WARNING: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  HOT: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  COLD: "border-white/16 bg-white/[0.04] text-neutral-300",
  FAILED: "border-red-400/25 bg-red-500/10 text-red-300",
  ERROR: "border-red-400/25 bg-red-500/10 text-red-300",
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
