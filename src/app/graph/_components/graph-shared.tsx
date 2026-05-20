import { Network } from "lucide-react";

export function LegendChip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-400">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function EmptyGraph() {
  return (
    <div className="grid min-h-[520px] place-items-center rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
      <div>
        <Network className="mx-auto h-8 w-8 text-neutral-700" />
        <h2 className="mt-4 text-lg text-white">No graph connections yet</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">Add documents with tags or run topic backfill to populate the map.</p>
      </div>
    </div>
  );
}

export function GraphStats({ nodes, edges, topics }: { nodes: number; edges: number; topics: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <h2 className="text-sm font-medium text-white">Connections</h2>
      <div className="mt-4 space-y-3">
        <Metric label="Nodes" value={String(nodes)} />
        <Metric label="Edges" value={String(edges)} />
        <Metric label="Topics" value={String(topics)} />
      </div>
    </div>
  );
}

export function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Network; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-all duration-200 ${
        active ? "bg-white text-black" : "text-neutral-500 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function shortLabel(label: string) {
  return label.length > 24 ? `${label.slice(0, 22)}...` : label;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <span className="font-jetbrains text-xs text-neutral-500">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
