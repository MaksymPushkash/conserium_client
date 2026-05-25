import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function LinkButton({ href, variant = "default", children }: { href: string; variant?: "default" | "secondary"; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-white/20",
        variant === "default"
          ? "border-white bg-white text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-neutral-200"
          : "border-white/10 bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]",
      )}
    >
      {children}
    </Link>
  );
}
