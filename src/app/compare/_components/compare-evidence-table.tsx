"use client";

import type { CompareDocumentsResponse } from "@/lib/types";

export function CompareEvidenceTable({ comparison }: { comparison: CompareDocumentsResponse }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <div className="grid min-w-[860px] grid-cols-[0.8fr_1fr_1fr_1fr] border-b border-white/10 bg-white/[0.04] px-3 py-2 font-jetbrains text-xs text-neutral-400">
        <span>Dimension</span>
        <span>{comparison.left_title}</span>
        <span>{comparison.right_title}</span>
        <span>Assessment</span>
      </div>
      {comparison.evidence_rows.map((row) => (
        <div
          key={row.dimension}
          className="grid min-w-[860px] grid-cols-[0.8fr_1fr_1fr_1fr] gap-3 border-b border-white/10 px-3 py-3 text-sm last:border-b-0"
        >
          <span className="space-y-2 font-medium capitalize text-white">
            <span className="block">{row.dimension.replace("_", " ")}</span>
            {row.confidence === 0 ? (
              <span className="font-jetbrains inline-flex rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-200">
                Inferred
              </span>
            ) : null}
          </span>
          <p className="font-jetbrains text-xs leading-5 text-neutral-300">{row.left_evidence ?? "No direct evidence."}</p>
          <p className="font-jetbrains text-xs leading-5 text-neutral-300">{row.right_evidence ?? "No direct evidence."}</p>
          <p className="font-jetbrains text-xs leading-5 text-neutral-400">
            {row.assessment}
            {row.rationale ? <span className="mt-2 block text-[11px] text-neutral-500">{row.rationale}</span> : null}
          </p>
        </div>
      ))}
    </div>
  );
}
