"use client";

import { RefragPanel } from "@/components/refrag-panel";
import { SourceCard } from "@/components/source-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEBUG_UI_ENABLED } from "@/lib/config";
import type { QuerySource } from "@/lib/types";
import type { ChatMessage } from "@/stores/chat-store";
import { RetrievalDebugPanel } from "./retrieval-debug-panel";

interface SourcesPanelProps {
  latestAssistant?: ChatMessage;
  debugOpen: boolean;
  onPreview: (source: QuerySource) => void;
}

export function SourcesPanel({ latestAssistant, debugOpen, onPreview }: SourcesPanelProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 max-h-[calc(100vh-48px)] space-y-4 overflow-auto">
        <Card className="border-white/10 bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestAssistant?.sources?.length ? (
              latestAssistant.sources.map((source, index) => (
                <SourceCard key={source.chunk_id} source={source} index={index + 1} onPreview={onPreview} />
              ))
            ) : (
              <div className="font-jetbrains text-xs font-light leading-6 text-neutral-500">Sources will appear after retrieval.</div>
            )}
          </CardContent>
        </Card>
        {DEBUG_UI_ENABLED && debugOpen ? <RetrievalDebugPanel debug={latestAssistant?.debug} /> : null}
        {DEBUG_UI_ENABLED && debugOpen ? <RefragPanel context={latestAssistant?.refragContext} /> : null}
        {DEBUG_UI_ENABLED && debugOpen && latestAssistant?.evalScores ? (
          <Card className="border-white/10 bg-white/[0.015]">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Eval / trace</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="font-jetbrains overflow-auto rounded-md border border-white/10 bg-black p-3 text-xs font-light leading-5 text-neutral-300">
                {JSON.stringify({ eval_scores: latestAssistant.evalScores, trace_id: latestAssistant.traceId }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </aside>
  );
}
