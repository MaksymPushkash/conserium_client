import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-soft-in rounded-xl border border-white/10 bg-white/[0.025] p-6 text-center shadow-2xl shadow-black/20",
        className,
      )}
    >
      {icon ? <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300">{icon}</div> : null}
      <h2 className="text-base font-medium text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
