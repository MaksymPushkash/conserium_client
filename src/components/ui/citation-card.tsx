import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CitationCardProps = {
  index?: number;
  title: string;
  detail?: string;
  excerpt?: string;
  href?: string;
  className?: string;
};

export function CitationCard({ index, title, detail, excerpt, href, className }: CitationCardProps) {
  const content = (
    <div
      className={cn(
        "group rounded-xl border border-white/10 bg-white/[0.035] p-3 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {typeof index === "number" ? <Badge className="border-white/20 bg-white/[0.06] text-neutral-200">[{index}]</Badge> : null}
            <p className="truncate text-sm font-medium text-white">{title}</p>
          </div>
          {detail ? <p className="mt-1 text-xs text-neutral-400">{detail}</p> : null}
        </div>
        {href ? <ExternalLink className="h-4 w-4 shrink-0 text-neutral-500 transition-colors group-hover:text-white" /> : null}
      </div>
      {excerpt ? <p className="font-jetbrains mt-3 line-clamp-3 text-sm leading-5 text-neutral-300">{excerpt}</p> : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
