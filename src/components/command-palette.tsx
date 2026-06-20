"use client";

import {
  ArrowRight,
  FileText,
  Files,
  Folder,
  Gauge,
  GitCompareArrows,
  Goal,
  MessageSquare,
  Network,
  PanelsTopLeft,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  ServerCog,
  Settings,
  Tags,
  X,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PaletteAction = {
  href: Route;
  label: string;
  description: string;
  icon: typeof Search;
  keywords: string;
  group: "create" | "ask" | "review" | "manage" | "browse";
};

const actions: PaletteAction[] = [
  { href: "/ingest", label: "Ingest", description: "Add source", icon: Plus, keywords: "upload url pdf image text markdown", group: "create" },
  { href: "/processing", label: "Processing", description: "Jobs", icon: ServerCog, keywords: "jobs queue retry failed processing ingest embeddings enrichment exports", group: "manage" },
  { href: "/notes", label: "Note", description: "Write memory", icon: FileText, keywords: "markdown writing notes", group: "create" },
  { href: "/drafts", label: "Draft", description: "Generate doc", icon: PenLine, keywords: "generate writing export", group: "create" },
  { href: "/chat", label: "Chat", description: "Ask knowledge", icon: MessageSquare, keywords: "ask conserium query chat", group: "ask" },
  { href: "/compare", label: "Compare", description: "Two documents", icon: PanelsTopLeft, keywords: "document comparison compare", group: "ask" },
  { href: "/knowledge-gaps", label: "Gaps", description: "Coverage", icon: Gauge, keywords: "knowledge gaps coverage", group: "review" },
  { href: "/conflicts", label: "Conflicts", description: "Claims", icon: GitCompareArrows, keywords: "claims contradictions conflicts", group: "review" },
  { href: "/graph", label: "Graph", description: "Map", icon: Network, keywords: "knowledge graph relations map", group: "review" },
  { href: "/documents", label: "Library", description: "Sources", icon: Files, keywords: "documents sources search library", group: "browse" },
  { href: "/topics", label: "Topics", description: "Clusters", icon: Tags, keywords: "clusters tags topics", group: "browse" },
  { href: "/learning-goals", label: "Goals", description: "Plans", icon: Goal, keywords: "learning goals resources", group: "browse" },
  { href: "/collections", label: "Collections", description: "Organize", icon: Folder, keywords: "collections folders", group: "manage" },
  { href: "/repo-syncs", label: "Repo sync", description: "GitHub", icon: RefreshCw, keywords: "github markdown sync repository", group: "manage" },
  { href: "/settings", label: "Settings", description: "Account", icon: Settings, keywords: "account preferences integrations", group: "manage" },
];

const groupLabels: Record<PaletteAction["group"], string> = {
  create: "Create",
  ask: "Ask",
  review: "Review",
  browse: "Browse",
  manage: "Manage",
};

const RECENT_ACTIONS_KEY = "conserium:recent-command-actions";

export const COMMAND_PALETTE_EVENT = "conserium:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentHrefs, setRecentHrefs] = useState<string[]>([]);

  const filteredActions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? actions.filter((action) => `${action.label} ${action.description} ${action.keywords}`.toLowerCase().includes(needle))
      : actions;
  }, [query]);

  const groupedActions = useMemo(() => {
    return (["create", "ask", "review", "browse", "manage"] as PaletteAction["group"][]).map((group) => ({
      group,
      items: filteredActions.filter((action) => action.group === group),
    }));
  }, [filteredActions]);

  const recentActions = useMemo(() => {
    if (query.trim()) return [];
    return recentHrefs
      .map((href) => actions.find((action) => action.href === href))
      .filter((action): action is PaletteAction => Boolean(action));
  }, [query, recentHrefs]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (!editing && event.key === "/") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpenPalette() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpenPalette);
    setRecentHrefs(readRecentActions());
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpenPalette);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function navigate(href: Route) {
    const nextRecent = [href, ...recentHrefs.filter((item) => item !== href)].slice(0, 3);
    setRecentHrefs(nextRecent);
    writeRecentActions(nextRecent);
    setOpen(false);
    router.push(href);
  }

  function onPaletteKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filteredActions.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && filteredActions[activeIndex]) {
      event.preventDefault();
      navigate(filteredActions[activeIndex].href);
    }
  }

  return open ? (
    <div className="animate-overlay-in fixed inset-0 z-50 bg-black/78 backdrop-blur-lg" onMouseDown={() => setOpen(false)}>
      <div
        className="animate-palette-in mx-auto mt-[8vh] flex max-h-[82vh] w-[min(94vw,680px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/60"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 p-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onPaletteKeyDown}
              placeholder="Search pages, actions, sources..."
              className="h-11 border-white/10 bg-black/40 pl-9 text-base"
            />
          </div>
          <kbd className="hidden rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-jetbrains text-xs text-neutral-500 sm:block">
            ⌘K
          </kbd>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close command palette">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="scrollbar-thin grid gap-3 overflow-y-auto p-3">
          {filteredActions.length ? (
            <>
              {recentActions.length ? (
                <section className="grid gap-2">
                  <div className="font-jetbrains px-1 text-[10px] uppercase tracking-[0.22em] text-neutral-400">Recent</div>
                  <div className="grid gap-1">
                    {recentActions.map((action) => (
                      <PaletteActionButton
                        key={action.href}
                        action={action}
                        active={filteredActions[activeIndex]?.href === action.href}
                        onMouseEnter={() => setActiveIndex(filteredActions.findIndex((item) => item.href === action.href))}
                        onClick={() => navigate(action.href)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {groupedActions.map(({ group, items }) =>
                items.length ? (
                <section key={group} className="grid gap-2">
                  <div className="font-jetbrains px-1 text-[10px] uppercase tracking-[0.22em] text-neutral-400">{groupLabels[group]}</div>
                  <div className="grid gap-1">
                    {items.map((action) => {
                      const absoluteIndex = filteredActions.findIndex((item) => item.href === action.href);
                      return (
                        <PaletteActionButton
                          key={action.href}
                          action={action}
                          active={absoluteIndex === activeIndex}
                          onClick={() => navigate(action.href)}
                          onMouseEnter={() => setActiveIndex(absoluteIndex)}
                        />
                      );
                    })}
                  </div>
                </section>
                ) : null,
              )}
            </>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-10 text-center text-sm text-neutral-500">No matches.</div>
          )}
        </div>
      </div>
    </div>
  ) : null;
}

function PaletteActionButton({ action, active, onClick, onMouseEnter }: { action: PaletteAction; active: boolean; onClick: () => void; onMouseEnter: () => void }) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex h-11 items-center gap-3 rounded-lg border border-transparent px-2 text-left transition-all duration-150 hover:border-white/10 hover:bg-white/[0.06]",
        active && "border-white/25 bg-white/[0.08]",
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-black/35 text-neutral-300 transition-colors group-hover:text-white">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="block truncate text-sm font-medium text-white">{action.label}</span>
        <span className="block truncate text-xs text-neutral-400">{action.description}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-neutral-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
    </button>
  );
}

function readRecentActions(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_ACTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 3) : [];
  } catch {
    return [];
  }
}

function writeRecentActions(values: string[]) {
  try {
    window.localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(values));
  } catch {
    // Ignore storage failures; navigation still works.
  }
}
