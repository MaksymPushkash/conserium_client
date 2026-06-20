"use client";

import type { DocumentProcessingStep, DocumentStatusResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProcessingTimelineProps {
  status: DocumentStatusResponse | undefined;
}

export function ProcessingTimeline({ status }: ProcessingTimelineProps) {
  const timeline = status?.timeline ?? [];
  if (!timeline.length) {
    return <div className="font-jetbrains text-xs text-neutral-500">Timeline unavailable.</div>;
  }
  return (
    <div className="space-y-3">
      {timeline.map((step) => (
        <TimelineStep key={step.key} step={step} />
      ))}
    </div>
  );
}

function TimelineStep({ step }: { step: DocumentProcessingStep }) {
  return (
    <div className="grid grid-cols-[18px_1fr] gap-3">
      <div className={cn("mt-1 h-3 w-3 rounded-full border", markerStyle(step.state))} />
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-neutral-100">{step.label}</div>
          <div className="font-jetbrains text-xs text-neutral-500">{step.state}</div>
        </div>
        {step.message ? <div className="mt-1 text-xs leading-5 text-neutral-500">{step.message}</div> : null}
      </div>
    </div>
  );
}

function markerStyle(state: string) {
  if (state === "complete") return "border-neutral-200 bg-neutral-200";
  if (state === "current") return "border-neutral-400 bg-neutral-400";
  if (state === "failed") return "border-neutral-500 bg-neutral-500";
  return "border-white/20 bg-transparent";
}
