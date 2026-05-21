import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border border-white/10 bg-white/[0.05] px-2 text-xs font-medium text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        className,
      )}
      {...props}
    />
  );
}
