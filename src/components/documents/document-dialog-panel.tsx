"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface DialogPanelProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function DialogPanel({ title, children, onClose }: DialogPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-black p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-normal text-white">{title}</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
