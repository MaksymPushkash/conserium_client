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
  group: "primary" | "workspace" | "intelligence" | "system";
};

const actions: PaletteAction[] = [
  { href: "/documents", label: "Library", description: "Search saved sources", icon: Files, keywords: "documents sources search library", group: "primary" },
  { href: "/ingest", label: "Ingest", description: "Add URLs, files, text", icon: Plus, keywords: "upload url pdf image text markdown", group: "primary" },
  { href: "/chat", label: "Chat", description: "Ask over saved context", icon: MessageSquare, keywords: "ask cortex query chat", group: "primary" },
  { href: "/drafts", label: "Drafts", description: "Generate Markdown", icon: PenLine, keywords: "generate writing export", group: "primary" },
  { href: "/graph", label: "Graph", description: "Map topics and documents", icon: Network, keywords: "knowledge graph relations map", group: "primary" },
  { href: "/notes", label: "Notes", description: "Write and link notes", icon: FileText, keywords: "markdown writing notes", group: "workspace" },
  { href: "/topics", label: "Topics", description: "Browse clusters", icon: Tags, keywords: "clusters tags topics", group: "workspace" },
  { href: "/compare", label: "Compare", description: "Compare two documents", icon: PanelsTopLeft, keywords: "document comparison compare", group: "workspace" },
  { href: "/collections", label: "Collections", description: "Organize material", icon: Folder, keywords: "collections folders", group: "workspace" },
  { href: "/knowledge-gaps", label: "Gaps", description: "Check coverage", icon: Gauge, keywords: "knowledge gaps coverage", group: "intelligence" },
  { href: "/learning-goals", label: "Goals", description: "Track learning plans", icon: Goal, keywords: "learning goals resources", group: "intelligence" },
  { href: "/conflicts", label: "Conflicts", description: "Find opposing claims", icon: GitCompareArrows, keywords: "claims contradictions conflicts", group: "intelligence" },
  { href: "/repo-syncs", label: "Repo sync", description: "GitHub Markdown sync", icon: RefreshCw, keywords: "github markdown sync repository", group: "system" },
  { href: "/settings", label: "Settings", description: "Account and integrations", icon: Settings, keywords: "account preferences integrations", group: "system" },
];

const groupLabels: Record<PaletteAction["group"], string> = {
  primary: "Common",
  workspace: "Workspace",
  intelligence: "Intelligence",
  system: "System",
};

export const COMMAND_PALETTE_EVENT = "cortex:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredActions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? actions.filter((action) => `${action.label} ${action.description} ${action.keywords}`.toLowerCase().includes(needle))
      : actions;
  }, [query]);

  const groupedActions = useMemo(() => {
    return (["primary", "workspace", "intelligence", "system"] as PaletteAction["group"][]).map((group) => ({
      group,
      items: filteredActions.filter((action) => action.group === group),
    }));
  }, [filteredActions]);

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
        className="animate-palette-in mx-auto mt-[10vh] w-[min(94vw,760px)] overflow-hidden rounded-2xl border border-white/10 bg-[#151517] shadow-2xl shadow-black/60"
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

        <div className="grid gap-3 p-3">
          {filteredActions.length ? (
            groupedActions.map(({ group, items }) =>
              items.length ? (
                <section key={group} className="grid gap-2">
                  <div className="font-jetbrains px-1 text-[10px] uppercase tracking-[0.22em] text-neutral-600">{groupLabels[group]}</div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {items.map((action) => {
                      const absoluteIndex = filteredActions.findIndex((item) => item.href === action.href);
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.href}
                          type="button"
                          onClick={() => navigate(action.href)}
                          onMouseEnter={() => setActiveIndex(absoluteIndex)}
                          className={cn(
                            "group flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]",
                            absoluteIndex === activeIndex && "border-white/25 bg-white/[0.07]",
                          )}
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/35 text-neutral-400 transition-colors group-hover:text-white">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">{action.label}</span>
                            <span className="mt-1 block truncate text-xs text-neutral-500">{action.description}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-neutral-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null,
            )
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-10 text-center text-sm text-neutral-500">No matches.</div>
          )}
        </div>
      </div>
    </div>
  ) : null;
}
