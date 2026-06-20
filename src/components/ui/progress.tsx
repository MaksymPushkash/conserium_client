import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className={cn("h-full bg-neutral-200 transition-all duration-500 ease-out", indicatorClassName)}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
