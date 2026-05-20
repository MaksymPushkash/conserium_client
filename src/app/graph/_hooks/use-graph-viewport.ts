import type { PointerEvent, WheelEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { GraphViewport, PositionedNode } from "../_components/graph-types";
import { clamp } from "../_components/graph-shared";

export const GRAPH_CANVAS_WIDTH = 1040;
export const GRAPH_CANVAS_HEIGHT = 720;

const DEFAULT_VIEWPORT: GraphViewport = { x: 0, y: 0, scale: 1 };

export function useGraphViewport(selectedNode: PositionedNode | null) {
  const [viewport, setViewport] = useState<GraphViewport>(DEFAULT_VIEWPORT);
  const [panStart, setPanStart] = useState<{ pointerId: number; x: number; y: number; viewport: GraphViewport } | null>(null);
  const fittedNodeId = useRef<string | null>(null);

  const fitToNode = useCallback((node: PositionedNode) => {
    const scale = 1.45;
    setViewport({
      x: GRAPH_CANVAS_WIDTH / 2 - node.x * scale,
      y: GRAPH_CANVAS_HEIGHT / 2 - node.y * scale,
      scale,
    });
    fittedNodeId.current = node.id;
  }, []);

  useEffect(() => {
    if (!selectedNode || selectedNode.id === fittedNodeId.current) return;
    fitToNode(selectedNode);
  }, [fitToNode, selectedNode]);

  function handleWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    zoomBy(direction * 0.12);
  }

  function zoomBy(delta: number) {
    setViewport((current) => ({
      ...current,
      scale: clamp(current.scale + delta, 0.55, 2.25),
    }));
  }

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanStart({ pointerId: event.pointerId, x: event.clientX, y: event.clientY, viewport });
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!panStart || panStart.pointerId !== event.pointerId) return;
    setViewport({
      ...panStart.viewport,
      x: panStart.viewport.x + event.clientX - panStart.x,
      y: panStart.viewport.y + event.clientY - panStart.y,
    });
  }

  function handlePointerEnd(pointerId: number) {
    if (panStart?.pointerId === pointerId) setPanStart(null);
  }

  function resetViewport() {
    fittedNodeId.current = null;
    setViewport(DEFAULT_VIEWPORT);
  }

  return {
    viewport,
    panStart,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    resetViewport,
    zoomIn: () => zoomBy(0.18),
    zoomOut: () => zoomBy(-0.18),
  };
}
