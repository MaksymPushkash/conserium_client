"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { openCommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { nav } from "./nav";

export function MobileNav({
  pathname,
  open,
  onToggle,
  onClose,
  onLogout,
}: {
  pathname: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/95 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <span className="text-lg font-normal tracking-tight text-white">CORTEX</span>
          <span className="font-jetbrains rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-light text-neutral-500">
            v0.1.0
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={openCommandPalette} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className="font-light">
            Logout
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle navigation">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <nav className="grid gap-1 border-t border-neutral-900 px-2 py-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                onClick={onClose}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-light text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-white",
                  active && "bg-white/[0.08] text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
