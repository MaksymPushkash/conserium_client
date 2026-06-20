import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[var(--conserium-border)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[var(--conserium-button-bg)] bg-[var(--conserium-button-bg)] text-[var(--conserium-button-text)] shadow-[0_0_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "border-[var(--conserium-border)] bg-[var(--conserium-card)] text-[var(--conserium-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 active:translate-y-0",
        ghost: "border-transparent bg-transparent text-[var(--conserium-text-muted)] hover:bg-[var(--conserium-card-muted)] hover:text-[var(--conserium-text)]",
        danger: "border-[var(--conserium-border)] bg-[var(--conserium-card)] text-[var(--conserium-text)] hover:bg-[var(--conserium-surface-strong)]",
        destructive: "border-[var(--conserium-border)] bg-[var(--conserium-card)] text-[var(--conserium-text)] hover:bg-[var(--conserium-surface-strong)]",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2 text-xs",
        icon: "h-9 w-9 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
