import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-[1500px] p-4 md:p-8", className)}>{children}</main>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="font-jetbrains text-[11px] uppercase tracking-[0.22em] text-neutral-400">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white md:text-4xl">{title}</h1>
        {description ? <p className="font-jetbrains mt-2 max-w-2xl text-sm leading-6 text-neutral-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionPanel({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {title || description || actions ? (
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            {title ? <CardTitle>{title}</CardTitle> : null}
            {description ? <p className="font-jetbrains mt-1 text-sm text-neutral-400">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ActionCard({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-white/10 bg-white/[0.035] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-neutral-300 transition-colors group-hover:text-white">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="font-jetbrains mt-1 text-sm leading-5 text-neutral-400">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-jetbrains text-[11px] uppercase tracking-[0.2em] text-neutral-400">{label}</p>
          <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
          {detail ? <div className="font-jetbrains mt-2 truncate text-sm text-neutral-400">{detail}</div> : null}
        </div>
        {icon ? <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-neutral-300">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
