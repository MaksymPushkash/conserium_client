import { GitBranch } from "lucide-react";
import type { ReactNode } from "react";

import type { PositionedNode } from "./graph-types";

export function PanelSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="border-b border-white/10 p-4">
        <p className="font-jetbrains text-xs uppercase tracking-[0.16em] text-neutral-500">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-medium text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function InspectorMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/35 p-3">
      <div className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

export function ConnectionList({ nodes, onSelectNode }: { nodes: PositionedNode[]; onSelectNode: (node: PositionedNode) => void }) {
  if (!nodes.length) {
    return <p className="text-sm text-neutral-500">No connected nodes in the current view.</p>;
  }
  return (
    <div className="space-y-2">
      {nodes.slice(0, 12).map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onSelectNode(node)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/35 p-3 text-left text-sm text-neutral-300 transition-colors hover:bg-white/[0.045] hover:text-white"
        >
          <span className="min-w-0">
            <span className="block truncate">{node.label}</span>
            <span className="font-jetbrains mt-1 block text-xs uppercase tracking-[0.12em] text-neutral-600">{node.kind}</span>
          </span>
          <GitBranch className="h-4 w-4 shrink-0 text-neutral-600" />
        </button>
      ))}
    </div>
  );
}
