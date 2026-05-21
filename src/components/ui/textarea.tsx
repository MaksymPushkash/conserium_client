import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-500 hover:border-white/20 focus:border-white/35 focus:ring-2 focus:ring-white/10",
        className,
      )}
      {...props}
    />
  );
}
