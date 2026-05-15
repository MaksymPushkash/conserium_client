"use client";

import { Badge } from "@/components/ui/badge";

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[100px_minmax(0,1fr)] gap-5 border-b border-white/10 pb-3">
      <div className="font-jetbrains text-neutral-500">{label}</div>
      <div className="min-w-0 break-words text-neutral-100 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

export function SuggestedQuestions({ values }: { values: string[] }) {
  if (!values.length) return null;
  return (
    <div>
      <div className="font-jetbrains mb-2 text-xs text-neutral-500">Suggested questions</div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="font-jetbrains max-w-full rounded-md border border-white/10 px-2 py-1 text-xs text-neutral-400 [overflow-wrap:anywhere]">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TagBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <div className="mb-3 text-sm font-normal text-neutral-100">{title}</div>
      <div className="font-jetbrains flex flex-wrap gap-2">
        {values.length ? values.map((value) => <Badge key={value}>{value}</Badge>) : <span className="text-sm text-neutral-500">None</span>}
      </div>
    </div>
  );
}

export function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <div className="mb-3 text-sm font-normal text-neutral-100">{title}</div>
      <pre className="font-jetbrains max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-white/10 bg-black p-3 text-xs leading-5 text-neutral-300 [overflow-wrap:anywhere]">
        {value ? JSON.stringify(value, null, 2) : "None"}
      </pre>
    </div>
  );
}
