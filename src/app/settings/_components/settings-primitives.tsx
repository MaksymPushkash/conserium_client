import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-jetbrains text-xs text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-white" />
    </label>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-5 border-b border-white/10 pb-3">
      <div className="font-jetbrains text-neutral-500">{label}</div>
      <div className="break-words text-neutral-100">{value}</div>
    </div>
  );
}

export const selectClassName =
  "h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none transition-colors focus:border-white/40 disabled:opacity-60";
