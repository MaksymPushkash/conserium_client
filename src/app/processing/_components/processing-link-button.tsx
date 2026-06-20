import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function LinkButton({ href, variant = "default", children }: { href: string; variant?: "default" | "secondary"; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[var(--conserium-border)]",
        variant === "default"
          ? "border-[var(--conserium-button-bg)] bg-[var(--conserium-button-bg)] text-[var(--conserium-button-text)] shadow-[0_0_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
          : "border-[var(--conserium-border)] bg-[var(--conserium-card)] text-[var(--conserium-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-[var(--conserium-text-muted)]",
      )}
    >
      {children}
    </Link>
  );
}
