import { AlertTriangle, BookOpen, LinkIcon, Network, Sparkles } from "lucide-react";

import type { GraphTool } from "./graph-types";

const graphTools: Array<{ id: GraphTool; title: string; description: string; icon: typeof Network }> = [
  { id: "knowledge", title: "Knowledge", description: "Inspect the selected node and its connections.", icon: Network },
  { id: "glossary", title: "Glossary", description: "Topic terms extracted from saved material.", icon: BookOpen },
  { id: "links", title: "Go links", description: "Jump directly to topics and source documents.", icon: LinkIcon },
  { id: "concern", title: "Flag a concern", description: "Mark stale or weak context for review.", icon: AlertTriangle },
  { id: "adjacent", title: "Explore adjacent", description: "Walk neighboring topics and documents.", icon: Sparkles },
  { id: "insights", title: "Insights", description: "Find thin clusters, stale areas, and dense documents.", icon: Sparkles },
];

export function GraphSideTools({ activeTool, onActiveToolChange }: { activeTool: GraphTool; onActiveToolChange: (tool: GraphTool) => void }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-2">
      {graphTools.map((tool) => {
        const Icon = tool.icon;
        const active = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onActiveToolChange(tool.id)}
            className={`group flex w-full gap-3 rounded-lg p-3 text-left transition-all duration-200 ${
              active ? "bg-white/[0.08] text-white" : "text-neutral-500 hover:bg-white/[0.045] hover:text-neutral-100"
            }`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
            <span>
              <span className="block text-sm">{tool.title}</span>
              <span className="mt-1 block text-xs leading-5 text-neutral-600">{tool.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
