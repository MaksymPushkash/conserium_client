import {
  Activity,
  BookOpenCheck,
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
  ServerCog,
  Tags,
} from "lucide-react";
import type { Route } from "next";

import { DEBUG_UI_ENABLED } from "@/lib/config";

export const baseNav: Array<{ href: Route; label: string; icon: typeof Search; debugOnly?: boolean }> = [
  { href: "/dashboard", label: "Overview", icon: Search },
  { href: "/ingest", label: "Ingest", icon: Plus },
  { href: "/processing", label: "Processing", icon: ServerCog },
  { href: "/documents", label: "Library", icon: Files },
  { href: "/topics", label: "Topics", icon: Tags },
  { href: "/graph", label: "Graph", icon: Network },
  { href: "/knowledge-gaps", label: "Gaps", icon: Gauge },
  { href: "/learning-goals", label: "Goals", icon: Goal },
  { href: "/review", label: "Review", icon: BookOpenCheck },
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

export const nav = baseNav.filter((item) => !item.debugOnly || DEBUG_UI_ENABLED);

export const navGroups = [
  {
    label: "Workspace",
    items: nav.filter((item) => ["/dashboard", "/ingest", "/processing", "/documents", "/notes", "/chat"].includes(item.href)),
  },
  {
    label: "Intelligence",
    items: nav.filter((item) => ["/topics", "/graph", "/knowledge-gaps", "/learning-goals", "/review", "/conflicts"].includes(item.href)),
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
