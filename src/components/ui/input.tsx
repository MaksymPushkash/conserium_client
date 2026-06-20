import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-[var(--conserium-border)] bg-[var(--conserium-card)] px-3 text-sm text-[var(--conserium-text)] outline-none transition-all duration-200 placeholder:text-[var(--conserium-text-muted)] hover:border-[var(--conserium-text-muted)] focus:border-[var(--conserium-text-muted)] focus:ring-2 focus:ring-[var(--conserium-border)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
