import { ExternalLink, FilePlus, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { KnowledgeGraphInsight, KnowledgeGraphNode } from "@/lib/types";

import { GraphInsights } from "./graph-insights-panel";
import { ConnectionList, InspectorMetric, PanelSection } from "./graph-inspector-shared";
import { documentHref } from "./graph-layout";
import { TopicManagementPanel } from "./graph-topic-management-panel";
import type { GraphTool, PositionedNode } from "./graph-types";

export function GraphInspector({
  activeTool,
  clusters,
  insights,
  nodes,
  selectedNode,
  selectedConnections,
  concernText,
  concernSaved,
  concernSaving,
  concernError,
  noteSaving,
  noteError,
  topicActionPending,
  topicActionError,
  onConcernTextChange,
  onSaveConcern,
  onCreateNote,
  onRenameTopic,
  onMergeTopic,
  onPinTopic,
  onIgnoreTopic,
  onSelectNode,
}: {
  activeTool: GraphTool;
  clusters: Array<{ topic: KnowledgeGraphNode; documents: KnowledgeGraphNode[] }>;
  insights: KnowledgeGraphInsight[] | null;
  nodes: PositionedNode[];
  selectedNode: PositionedNode | null;
  selectedConnections: PositionedNode[];
  concernText: string;
  concernSaved: boolean;
  concernSaving: boolean;
  concernError: string | null;
  noteSaving: boolean;
  noteError: string | null;
  topicActionPending: boolean;
  topicActionError: string | null;
  ignoredVisible?: boolean;
  onConcernTextChange: (value: string) => void;
  onSaveConcern: () => void;
  onCreateNote: () => void;
  onRenameTopic: (displayName: string) => void;
  onMergeTopic: (sourceNames: string[]) => void;
  onPinTopic: () => void;
  onIgnoreTopic: () => void;
  onSelectNode: (node: PositionedNode) => void;
}) {
  const connectedTopics = selectedConnections.filter((node) => node.kind === "topic");
  const connectedDocuments = selectedConnections.filter((node) => node.kind === "document");
  const topSource = selectedNode?.kind === "document" ? selectedNode : connectedDocuments[0] ?? null;
  const askHref = selectedNode ? askHrefForNode(selectedNode) : "/chat";

  return (
    <aside className="rounded-xl border border-white/10 bg-white/[0.025]">
      {activeTool === "knowledge" ? (
        <PanelSection title={selectedNode ? selectedNode.label : "Select a node"} eyebrow="Knowledge">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="font-jetbrains text-xs uppercase tracking-[0.16em] text-neutral-300">{selectedNode.kind}</div>
                {selectedNode.detail ? <p className="mt-2 text-sm text-neutral-400">{selectedNode.detail}</p> : null}
                {selectedNode.summary ? <p className="mt-3 text-sm leading-6 text-neutral-300">{selectedNode.summary}</p> : null}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <InspectorMetric label="Topics" value={String(connectedTopics.length)} />
                <InspectorMetric label="Documents" value={String(connectedDocuments.length)} />
              </div>
              {topSource ? (
                <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                  <div className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">Top source</div>
                  <button
                    type="button"
                    onClick={() => onSelectNode(topSource)}
                    className="mt-2 text-left text-sm font-medium text-white transition-colors hover:text-neutral-100"
                  >
                    {topSource.label}
                  </button>
                </div>
              ) : null}
              <ConnectionList nodes={selectedConnections} onSelectNode={onSelectNode} />
              {selectedNode.kind === "topic" ? (
                <TopicManagementPanel
                  node={selectedNode}
                  pending={topicActionPending}
                  error={topicActionError}
                  onRenameTopic={onRenameTopic}
                  onMergeTopic={onMergeTopic}
                  onPinTopic={onPinTopic}
                  onIgnoreTopic={onIgnoreTopic}
                />
              ) : null}
              {selectedNode.kind === "document" && selectedNode.suggested_questions?.length ? (
                <div className="rounded-lg border border-white/10 bg-black/35 p-3">
                  <div className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">Suggested questions</div>
                  <div className="mt-3 grid gap-2">
                    {selectedNode.suggested_questions.slice(0, 3).map((question) => (
                      <Link
                        key={question}
                        href={`/chat?document=${selectedNode.id.replace("document:", "")}&q=${encodeURIComponent(question)}`}
                        className="text-sm leading-6 text-neutral-300 underline-offset-4 hover:text-white hover:underline"
                      >
                        {question}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href={selectedNode.kind === "document" ? documentHref(selectedNode) : `/topics/${encodeURIComponent(selectedNode.label)}`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.07] px-3 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.11]"
                >
                  {selectedNode.kind === "document" ? "Open document" : "Open topic"}
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link
                  href={askHref}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-neutral-100 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Ask about this
                  <MessageSquareText className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={onCreateNote}
                  disabled={noteSaving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-neutral-100 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {noteSaving ? "Creating note..." : "Create note from node"}
                  <FilePlus className="h-4 w-4" />
                </button>
              </div>
              {noteError ? <p className="text-sm text-neutral-400">{noteError}</p> : null}
            </div>
          ) : (
            <p className="text-sm leading-6 text-neutral-400">Hover isolates neighbors. Click a topic or document to inspect it here.</p>
          )}
        </PanelSection>
      ) : null}

      {activeTool === "glossary" ? (
        <PanelSection title="Glossary" eyebrow="Terms">
          <div className="space-y-2">
            {clusters.length ? (
              clusters.map((cluster) => (
                <Link
                  key={cluster.topic.id}
                  href={`/topics/${encodeURIComponent(cluster.topic.label)}`}
                  className="block rounded-lg border border-white/10 bg-black/35 p-3 transition-colors hover:bg-white/[0.045]"
                >
                  <div className="text-sm text-white">{cluster.topic.label}</div>
                  <div className="font-jetbrains mt-1 text-xs text-neutral-600">{cluster.documents.length} documents</div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No topic terms yet.</p>
            )}
          </div>
        </PanelSection>
      ) : null}

      {activeTool === "links" ? (
        <PanelSection title="Go links" eyebrow="Shortcuts">
          <div className="space-y-2">
            {nodes.slice(0, 18).map((node) => (
              <Link
                key={node.id}
                href={node.kind === "document" ? documentHref(node) : `/topics/${encodeURIComponent(node.label)}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/35 p-3 text-sm text-neutral-300 transition-colors hover:bg-white/[0.045] hover:text-white"
              >
                <span className="truncate">{node.label}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
              </Link>
            ))}
          </div>
        </PanelSection>
      ) : null}

      {activeTool === "concern" ? (
        <PanelSection title="Flag a concern" eyebrow="Review">
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-neutral-300">
              {selectedNode ? `Concern target: ${selectedNode.label}` : "Select a node first, or flag the current graph state."}
            </div>
            <textarea
              value={concernText}
              onChange={(event) => onConcernTextChange(event.target.value)}
              placeholder="What looks stale, weak, duplicated, or misleading?"
              className="min-h-36 w-full resize-none rounded-lg border border-white/10 bg-black/45 p-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-white/30"
            />
            <Button className="w-full" disabled={!concernText.trim() || concernSaving} onClick={onSaveConcern}>
              {concernSaving ? "Saving..." : "Save concern"}
            </Button>
            {concernError ? <p className="text-sm text-neutral-400">{concernError}</p> : null}
            {concernSaved ? <p className="text-sm text-neutral-200">Concern saved for review.</p> : null}
          </div>
        </PanelSection>
      ) : null}

      {activeTool === "adjacent" ? (
        <PanelSection title="Explore adjacent" eyebrow="Neighbors">
          <ConnectionList nodes={selectedConnections.length ? selectedConnections : nodes.slice(0, 10)} onSelectNode={onSelectNode} />
        </PanelSection>
      ) : null}

      {activeTool === "insights" ? (
        <PanelSection title="Graph insights" eyebrow="Signals">
          <GraphInsights insights={insights} clusters={clusters} nodes={nodes} onSelectNode={onSelectNode} />
        </PanelSection>
      ) : null}
    </aside>
  );
}

function askHrefForNode(node: PositionedNode) {
  if (node.kind === "document") return `/chat?document=${node.id.replace("document:", "")}`;
  return `/chat?topic=${encodeURIComponent(node.label)}&q=${encodeURIComponent(`What should I know about ${node.label}?`)}`;
}
