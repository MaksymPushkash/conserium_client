import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import { KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import type { KnowledgeGraphEdge } from "@/lib/types";
import { cn } from "@/lib/utils";

import { GRAPH_CANVAS_HEIGHT, GRAPH_CANVAS_WIDTH, useGraphViewport } from "../_hooks/use-graph-viewport";
import type { PositionedNode } from "./graph-types";
import { EmptyGraph, LegendChip, shortLabel } from "./graph-shared";

export function GraphCanvas({
  nodes,
  edges,
  nodesById,
  focusedNodeId,
  focusedIds,
  selectedNodeId,
  query,
  onQueryChange,
  onSelectNode,
  onHoverNode,
  onReset,
}: {
  nodes: PositionedNode[];
  edges: KnowledgeGraphEdge[];
  nodesById: Map<string, PositionedNode>;
  focusedNodeId: string | null;
  focusedIds: Set<string>;
  selectedNodeId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectNode: (node: PositionedNode) => void;
  onHoverNode: (nodeId: string | null) => void;
  onReset: () => void;
}) {
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : null;
  const {
    viewport,
    panStart,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    resetViewport,
    zoomIn,
    zoomOut,
  } = useGraphViewport(selectedNode);

  function handleNodeKeyDown(event: KeyboardEvent<SVGGElement>, node: PositionedNode) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectNode(node);
    }
  }

  function resetGraph() {
    resetViewport();
    onReset();
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#080808] shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-medium text-white">Map</h2>
          <p className="font-jetbrains mt-1 text-xs text-neutral-600">
            {nodes.length} visible nodes · {edges.length} visible edges
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
          <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search graph..." className="h-10 pl-9" />
        </div>
      </div>

      {nodes.length ? (
        <div className="relative min-h-[720px] overflow-hidden">
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
            <LegendChip label="Topic" color="#f4f4f5" />
            <LegendChip label="Document" color="#a3a3a3" />
            <LegendChip label="Dense" color="#737373" />
          </div>
          <svg
            viewBox={`0 0 ${GRAPH_CANVAS_WIDTH} ${GRAPH_CANVAS_HEIGHT}`}
            className={cn("h-[720px] w-full touch-none", panStart ? "cursor-grabbing" : "cursor-grab")}
            role="img"
            aria-label="Interactive knowledge graph"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => handlePointerEnd(event.pointerId)}
            onPointerCancel={(event) => handlePointerEnd(event.pointerId)}
          >
            <defs>
              <radialGradient id="graph-vignette" cx="50%" cy="45%" r="70%">
                <stop offset="0%" stopColor="#181818" />
                <stop offset="100%" stopColor="#080808" />
              </radialGradient>
              <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="1040" height="720" fill="url(#graph-vignette)" />
            <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
              <g>
                {edges.map((edge) => {
                  const source = nodesById.get(edge.source_id);
                  const target = nodesById.get(edge.target_id);
                  if (!source || !target) return null;
                  const active = !focusedNodeId || (focusedIds.has(edge.source_id) && focusedIds.has(edge.target_id));
                  return (
                    <line
                      key={edge.id}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={active ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.07)"}
                      strokeWidth={active ? Math.max(1.2, Math.min(3, edge.score * 2.6)) : 0.7}
                    />
                  );
                })}
              </g>
              <g>
                {nodes.map((node) => {
                  const active = !focusedNodeId || focusedIds.has(node.id);
                  const selected = selectedNodeId === node.id;
                  const isTopic = node.kind === "topic";
                  const denseDocument = !isTopic && node.degree >= 4;
                  const docWidth = Math.max(76, Math.min(150, node.label.length * 5.6 + 28));
                  const docHeight = 32;
                  return (
                    <g
                      key={node.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${node.label}`}
                      onClick={() => onSelectNode(node)}
                      onPointerDown={(event) => event.stopPropagation()}
                      onKeyDown={(event) => handleNodeKeyDown(event, node)}
                      onMouseEnter={() => onHoverNode(node.id)}
                      onMouseLeave={() => onHoverNode(null)}
                      className="cursor-pointer outline-none transition-opacity duration-200"
                      opacity={active ? 1 : 0.28}
                    >
                      <title>{node.label}</title>
                      {isTopic ? (
                        <>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.radius + (selected ? 18 : 10)}
                            fill={selected ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)"}
                            filter={selected ? "url(#node-glow)" : undefined}
                          />
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.radius}
                            fill={node.is_pinned ? "#ffffff" : "#f4f4f5"}
                            stroke={selected ? "#ffffff" : "#070708"}
                            strokeWidth={selected ? 4 : 3}
                          />
                          {node.is_pinned ? (
                            <circle
                              cx={node.x + node.radius * 0.7}
                              cy={node.y - node.radius * 0.7}
                              r="5"
                              fill="#f5f5f5"
                              stroke="#070708"
                              strokeWidth="2"
                            />
                          ) : null}
                        </>
                      ) : (
                        <>
                          <rect
                            x={node.x - docWidth / 2}
                            y={node.y - docHeight / 2}
                            width={docWidth}
                            height={docHeight}
                            rx={9}
                            fill={selected ? "rgba(255,255,255,0.18)" : denseDocument ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}
                            stroke={selected ? "#ffffff" : denseDocument ? "#a3a3a3" : "#737373"}
                            strokeWidth={selected ? 3 : 1.4}
                            filter={selected ? "url(#node-glow)" : undefined}
                          />
                          <circle cx={node.x - docWidth / 2 + 13} cy={node.y} r="4" fill={denseDocument ? "#a3a3a3" : "#737373"} />
                        </>
                      )}
                      <text
                        x={isTopic ? node.x + node.radius + 10 : node.x - docWidth / 2 + 24}
                        y={node.y + 5}
                        fill={isTopic ? "#ffffff" : "#e4e4e7"}
                        fontSize={isTopic ? "14" : "10.5"}
                        fontFamily="JetBrainsMonoNLThin, monospace"
                      >
                        {shortLabel(node.label)}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
          <div className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 shadow-xl shadow-black/30">
            <button
              type="button"
              onClick={zoomOut}
              aria-label="Zoom out"
              className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              aria-label="Zoom in"
              className="grid h-7 w-7 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="mx-1 h-4 w-px bg-white/10" />
            <button
              type="button"
              onClick={resetGraph}
              aria-label="Reset graph viewport"
              className="inline-flex h-7 items-center gap-2 rounded-full px-3 font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
          <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-jetbrains text-xs text-neutral-600">
            drag to pan · wheel to zoom · click to inspect
          </div>
        </div>
      ) : (
        <EmptyGraph />
      )}
    </section>
  );
}
