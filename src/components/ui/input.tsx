import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-neutral-500 hover:border-white/20 focus:border-white/35 focus:ring-2 focus:ring-white/10",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
