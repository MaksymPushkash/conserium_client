"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Activity, FileText, Files, Folder, LogOut, Menu, MessageSquare, Plus, Search, User, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api";
import { DEBUG_UI_ENABLED } from "@/lib/config";
import { endSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const baseNav: Array<{ href: Route; label: string; icon: typeof Search; debugOnly?: boolean }> = [
  { href: "/dashboard", label: "Overview", icon: Search },
  { href: "/ingest", label: "Ingest", icon: Plus },
  { href: "/documents", label: "Library", icon: Files },
  { href: "/collections", label: "Collections", icon: Folder },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/debug", label: "Debug", icon: Activity, debugOnly: true },
  { href: "/account", label: "Account", icon: User },
];

const nav = baseNav.filter((item) => !item.debugOnly || DEBUG_UI_ENABLED);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isPublicRoute = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    if (!accessToken && !isPublicRoute) {
      router.replace("/auth");
    }
  }, [accessToken, isPublicRoute, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      endSession(queryClient);
      router.replace("/auth");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-neutral-900 bg-black md:block">
        <Link href="/dashboard" className="flex h-20 items-center gap-3 border-b border-neutral-900 px-5">
          <span className="text-2xl font-normal tracking-tight text-white">CORTEX</span>
          <span className="font-jetbrains rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-light text-neutral-500">
            v0.1.0
          </span>
        </Link>
        <nav className="space-y-1 px-4 py-6">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2 text-sm font-light text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
                  active && "bg-white/[0.08] text-white hover:bg-white/[0.12] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start font-light"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-black/95 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
            <span className="text-lg font-normal tracking-tight text-white">CORTEX</span>
            <span className="font-jetbrains rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-light text-neutral-500">
              v0.1.0
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="font-light">
              Logout
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {mobileNavOpen ? (
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
                  onClick={() => setMobileNavOpen(false)}
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
      <main className="md:pl-64">{children}</main>
    </div>
  );
}
