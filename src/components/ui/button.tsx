import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-white bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-neutral-200 active:translate-y-0",
        secondary:
          "border-white/10 bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] active:translate-y-0",
        ghost: "border-transparent bg-transparent text-neutral-300 hover:bg-white/10 hover:text-white",
        danger: "border-red-500/20 bg-red-500/8 text-red-200 hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-100",
        destructive: "border-red-500/20 bg-red-500/8 text-red-200 hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-100",
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
