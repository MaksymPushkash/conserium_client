"use client";

import { BookOpen, Plus, Search } from "lucide-react";
import Link from "next/link";

import { openCommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navGroups } from "./nav";
import { UserMenu } from "./user-menu";

export function Sidebar({
  pathname,
  displayName,
  email,
  initial,
  userMenuOpen,
  onUserMenuToggle,
  onUserMenuClose,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  displayName: string;
  email: string;
  initial: string;
  userMenuOpen: boolean;
  onUserMenuToggle: () => void;
  onUserMenuClose: () => void;
  onLogout: () => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#050509]/95 shadow-2xl shadow-black/40 md:flex md:flex-col">
      <div className="flex h-20 items-center justify-between px-5">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-sm font-medium text-white transition-transform duration-300 group-hover:scale-105">
            C
          </span>
          <span className="text-lg font-normal tracking-tight text-white">CORTEX</span>
        </Link>
        <div className="flex items-center gap-1 text-neutral-500">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("/ingest")} aria-label="Ingest">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate("/documents")} aria-label="Library">
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-5">
        <button
          type="button"
          onClick={openCommandPalette}
          className="group flex h-11 w-full items-center gap-3 rounded-lg border border-white/10 bg-black px-3 text-left text-sm text-neutral-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
        >
          <Search className="h-4 w-4 transition-colors group-hover:text-white" />
          <span className="flex-1">Search...</span>
          <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-500 transition-colors group-hover:text-neutral-300">
            ⌘ K
          </kbd>
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-4 pb-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">{group.label}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={cn(
                    "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-light text-neutral-400 transition-all duration-200 hover:bg-white/[0.055] hover:text-white",
                    active && "bg-white/[0.075] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_12px_28px_rgba(0,0,0,0.18)]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 h-5 w-0.5 rounded-full bg-transparent transition-all duration-200",
                      active && "bg-neutral-200 shadow-[0_0_14px_rgba(255,255,255,0.35)]",
                    )}
                  />
                  <Icon className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-105", active && "text-neutral-100")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <UserMenu
        open={userMenuOpen}
        displayName={displayName}
        email={email}
        initial={initial}
        onToggle={onUserMenuToggle}
        onClose={onUserMenuClose}
        onLogout={onLogout}
      />
    </aside>
  );
}
