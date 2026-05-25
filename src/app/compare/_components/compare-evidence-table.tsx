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
          <span className="font-medium capitalize text-white">{row.dimension.replace("_", " ")}</span>
          <p className="font-jetbrains text-xs leading-5 text-neutral-300">{row.left_evidence ?? "No direct evidence."}</p>
          <p className="font-jetbrains text-xs leading-5 text-neutral-300">{row.right_evidence ?? "No direct evidence."}</p>
          <p className="font-jetbrains text-xs leading-5 text-neutral-400">{row.assessment}</p>
        </div>
      ))}
    </div>
  );
}
