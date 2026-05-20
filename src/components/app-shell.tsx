"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  ChevronDown,
  FileText,
  Files,
  Folder,
  Gauge,
  GitCompareArrows,
  Goal,
  LogOut,
  Menu,
  MessageSquare,
  Network,
  RefreshCw,
  PanelsTopLeft,
  PenLine,
  Plus,
  Search,
  Settings,
  Tags,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { CommandPalette, openCommandPalette } from "@/components/command-palette";
import { GlobalDropIngest } from "@/components/global-drop-ingest";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/lib/api";
import { DEBUG_UI_ENABLED } from "@/lib/config";
import { endSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const baseNav: Array<{ href: Route; label: string; icon: typeof Search; debugOnly?: boolean }> = [
  { href: "/dashboard", label: "Overview", icon: Search },
  { href: "/ingest", label: "Ingest", icon: Plus },
  { href: "/documents", label: "Library", icon: Files },
  { href: "/topics", label: "Topics", icon: Tags },
  { href: "/graph", label: "Graph", icon: Network },
  { href: "/knowledge-gaps", label: "Gaps", icon: Gauge },
  { href: "/learning-goals", label: "Goals", icon: Goal },
  { href: "/conflicts", label: "Conflicts", icon: GitCompareArrows },
  { href: "/drafts", label: "Drafts", icon: PenLine },
  { href: "/compare", label: "Compare", icon: PanelsTopLeft },
  { href: "/repo-syncs", label: "Repo sync", icon: RefreshCw },
  { href: "/collections", label: "Collections", icon: Folder },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/debug", label: "Debug", icon: Activity, debugOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

const nav = baseNav.filter((item) => !item.debugOnly || DEBUG_UI_ENABLED);

const navGroups = [
  {
    label: "Workspace",
    items: nav.filter((item) => ["/dashboard", "/ingest", "/documents", "/notes", "/chat"].includes(item.href)),
  },
  {
    label: "Intelligence",
    items: nav.filter((item) => ["/topics", "/graph", "/knowledge-gaps", "/learning-goals", "/conflicts"].includes(item.href)),
  },
  {
    label: "Creation",
    items: nav.filter((item) => ["/drafts", "/compare"].includes(item.href)),
  },
  {
    label: "System",
    items: nav.filter((item) => ["/repo-syncs", "/collections", "/settings", "/debug"].includes(item.href)),
  },
].filter((group) => group.items.length > 0);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authHydrated = useAuthStore((state) => state.hydrated);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/public");

  useEffect(() => {
    if (!authHydrated) {
      return;
    }
    if (!accessToken && !isPublicRoute) {
      router.replace("/auth");
    }
  }, [accessToken, authHydrated, isPublicRoute, router]);

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    enabled: authHydrated && Boolean(accessToken) && !isPublicRoute,
  });

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!authHydrated) {
    return <div className="min-h-screen bg-[#0b0b0d]" />;
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      endSession(queryClient);
      router.replace("/auth");
    }
  }

  const displayName = userQuery.data?.display_name || userQuery.data?.email?.split("@")[0] || "Workspace";
  const email = userQuery.data?.email || "";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#050506] md:flex md:flex-col">
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-sm font-medium text-white transition-transform duration-300 group-hover:scale-105">
              C
            </span>
            <span className="text-lg font-normal tracking-tight text-white">CORTEX</span>
          </Link>
          <div className="flex items-center gap-1 text-neutral-500">
            <Button variant="ghost" size="icon" onClick={() => router.push("/ingest")} aria-label="Ingest">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push("/documents")} aria-label="Library">
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
              <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-700">{group.label}</div>
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
                      "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-light text-neutral-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-white",
                      active && "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 h-5 w-px rounded-full bg-transparent transition-colors duration-200",
                        active && "bg-white/70",
                      )}
                    />
                    <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="relative border-t border-white/10 p-4">
          {userMenuOpen ? (
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
                onClick={() => setUserMenuOpen(false)}
                className="block border-b border-white/10 px-4 py-3 text-sm text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                User Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className="flex h-12 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.06]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xs text-neutral-400">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">{displayName}</span>
              <span className="block truncate text-xs text-neutral-600">{email}</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform duration-200", userMenuOpen && "rotate-180")} />
          </button>
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
            <Button variant="ghost" size="icon" onClick={openCommandPalette} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
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
      <CommandPalette />
      <GlobalDropIngest />
      <main className="transition-[padding] duration-300 md:pl-72">{children}</main>
    </div>
  );
}
