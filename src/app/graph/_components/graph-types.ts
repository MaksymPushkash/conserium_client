import type { KnowledgeGraphNode } from "@/lib/types";

export type GraphView = "graph" | "list";
export type GraphTool = "knowledge" | "glossary" | "links" | "concern" | "adjacent";

export interface PositionedNode extends KnowledgeGraphNode {
  degree: number;
  radius: number;
  x: number;
  y: number;
}

export interface GraphViewport {
  x: number;
  y: number;
  scale: number;
}
