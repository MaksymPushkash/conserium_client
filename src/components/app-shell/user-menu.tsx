"use client";

import { ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function UserMenu({
  open,
  displayName,
  email,
  initial,
  onToggle,
  onClose,
  onLogout,
}: {
  open: boolean;
  displayName: string;
  email: string;
  initial: string;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="relative border-t border-white/10 p-4">
      {open ? (
        <div className="animate-soft-in absolute bottom-[76px] left-4 right-4 overflow-hidden rounded-lg border border-white/10 bg-[#131315] shadow-2xl shadow-black/60">
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-neutral-300">
              {initial}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm text-white">{displayName}</div>
              <div className="truncate text-xs text-neutral-500">{email}</div>
            </div>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="block border-b border-white/10 px-4 py-3 text-sm text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            User Settings
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onToggle}
        className="flex h-12 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xs text-neutral-400">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-white">{displayName}</span>
          <span className="block truncate text-xs text-neutral-500">{email}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform duration-200", open && "rotate-180")} />
      </button>
    </div>
  );
}
