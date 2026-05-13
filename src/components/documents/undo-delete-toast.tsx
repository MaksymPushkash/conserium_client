"use client";

import { Button } from "@/components/ui/button";

interface UndoDeleteToastProps {
  label: string;
  onUndo: () => void;
}

export function UndoDeleteToast({ label, onUndo }: UndoDeleteToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-lg border border-white/10 bg-black px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <div className="font-jetbrains text-xs font-light leading-5 text-neutral-300">{label}</div>
      <Button variant="secondary" size="sm" onClick={onUndo} className="font-normal">Undo</Button>
    </div>
  );
}
