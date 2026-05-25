import { ExternalLink, FilePlus, GitBranch, MessageSquareText, Pin, PinOff, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { KnowledgeGraphInsight, KnowledgeGraphNode } from "@/lib/types";

import { documentHref } from "./graph-layout";
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
              {noteError ? <p className="text-sm text-red-300">{noteError}</p> : null}
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
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 p-3 text-sm leading-6 text-amber-100/80">
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
            {concernError ? <p className="text-sm text-red-300">{concernError}</p> : null}
            {concernSaved ? <p className="text-sm text-emerald-400">Concern saved for review.</p> : null}
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

function TopicManagementPanel({
  node,
  pending,
  error,
  onRenameTopic,
  onMergeTopic,
  onPinTopic,
  onIgnoreTopic,
}: {
  node: PositionedNode;
  pending: boolean;
  error: string | null;
  onRenameTopic: (displayName: string) => void;
  onMergeTopic: (sourceNames: string[]) => void;
  onPinTopic: () => void;
  onIgnoreTopic: () => void;
}) {
  const defaultSourceNames = (node.source_names?.length ? node.source_names : [node.label]).join(", ");
  const [displayName, setDisplayName] = useState(node.label);
  const [sourceNames, setSourceNames] = useState(defaultSourceNames);
  const [confirmIgnore, setConfirmIgnore] = useState(false);
  const normalizedSources = sourceNames.split(",").map((value) => value.trim()).filter(Boolean);

  useEffect(() => {
    setDisplayName(node.label);
    setSourceNames(defaultSourceNames);
    setConfirmIgnore(false);
  }, [defaultSourceNames, node.id, node.label]);

  return (
    <div className="rounded-lg border border-white/10 bg-black/35 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">Topic management</div>
          <p className="mt-1 text-xs text-neutral-500">
            {node.is_pinned ? "Pinned topic" : "Regular topic"}
            {node.source_names?.length ? ` - ${node.source_names.length} source ${node.source_names.length === 1 ? "name" : "names"}` : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onPinTopic}
          disabled={pending}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-neutral-100 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={node.is_pinned ? "Unpin topic" : "Pin topic"}
        >
          {node.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <div className="rounded-md border border-white/10 bg-black/40 p-2">
          <div className="font-jetbrains text-[10px] uppercase tracking-[0.14em] text-neutral-600">Source names</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {normalizedSources.map((sourceName) => (
              <span key={sourceName} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300">
                {sourceName}
              </span>
            ))}
          </div>
        </div>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="h-9 w-full rounded-md border border-white/10 bg-black/45 px-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-white/30"
          placeholder="Display name"
        />
        <button
          type="button"
          onClick={() => onRenameTopic(displayName)}
          disabled={pending || !displayName.trim()}
          className="inline-flex h-9 w-full items-center justify-center rounded-md border border-white/15 bg-white/[0.07] px-3 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Rename topic
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <input
          value={sourceNames}
          onChange={(event) => setSourceNames(event.target.value)}
          className="h-9 w-full rounded-md border border-white/10 bg-black/45 px-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-700 focus:border-white/30"
          placeholder="source topic names, comma separated"
        />
        <button
          type="button"
          onClick={() => onMergeTopic(normalizedSources)}
          disabled={pending || normalizedSources.length < 2}
          className="inline-flex h-9 w-full items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-neutral-100 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Merge topics
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!confirmIgnore) {
            setConfirmIgnore(true);
            return;
          }
          onIgnoreTopic();
        }}
        disabled={pending}
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-red-500/25 bg-red-500/10 px-3 text-sm font-medium text-red-100 transition-colors hover:border-red-400/35 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirmIgnore ? "Confirm ignore" : "Ignore topic"}
        <ShieldOff className="h-4 w-4" />
      </button>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

function askHrefForNode(node: PositionedNode) {
  if (node.kind === "document") return `/chat?document=${node.id.replace("document:", "")}`;
  return `/chat?topic=${encodeURIComponent(node.label)}&q=${encodeURIComponent(`What should I know about ${node.label}?`)}`;
}

function PanelSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="border-b border-white/10 p-4">
        <p className="font-jetbrains text-xs uppercase tracking-[0.16em] text-neutral-500">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-medium text-white">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InspectorMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/35 p-3">
      <div className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function ConnectionList({ nodes, onSelectNode }: { nodes: PositionedNode[]; onSelectNode: (node: PositionedNode) => void }) {
  if (!nodes.length) {
    return <p className="text-sm text-neutral-500">No connected nodes in the current view.</p>;
  }
  return (
    <div className="space-y-2">
      {nodes.slice(0, 12).map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onSelectNode(node)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/35 p-3 text-left text-sm text-neutral-300 transition-colors hover:bg-white/[0.045] hover:text-white"
        >
          <span className="min-w-0">
            <span className="block truncate">{node.label}</span>
            <span className="font-jetbrains mt-1 block text-xs uppercase tracking-[0.12em] text-neutral-600">{node.kind}</span>
          </span>
          <GitBranch className="h-4 w-4 shrink-0 text-neutral-600" />
        </button>
      ))}
    </div>
  );
}

function GraphInsights({
  insights,
  clusters,
  nodes,
  onSelectNode,
}: {
  insights: KnowledgeGraphInsight[] | null;
  clusters: Array<{ topic: KnowledgeGraphNode; documents: KnowledgeGraphNode[] }>;
  nodes: PositionedNode[];
  onSelectNode: (node: PositionedNode) => void;
}) {
  if (insights?.length) {
    const positionedById = new Map(nodes.map((node) => [node.id, node]));
    return (
      <div className="space-y-3">
        {insights.map((item) => (
          <div key={item.kind} className="rounded-lg border border-white/10 bg-black/35 p-3">
            <div className="flex items-start justify-between gap-3">
              <span>
                <span className="font-jetbrains block text-xs uppercase tracking-[0.14em] text-neutral-500">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-neutral-500">{item.description}</span>
              </span>
              <span className="text-lg font-medium text-white">{item.count}</span>
            </div>
            {item.nodes.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.nodes.slice(0, 4).map((node) => {
                  const positioned = positionedById.get(node.id);
                  return positioned ? (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => onSelectNode(positioned)}
                      className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300 transition hover:border-white/25 hover:text-white"
                    >
                      {node.label}
                    </button>
                  ) : (
                    <span key={node.id} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-neutral-500">
                      {node.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }
  const isolatedTopics = nodes.filter((node) => node.kind === "topic" && node.degree === 0);
  const pinnedTopics = nodes.filter((node) => node.kind === "topic" && node.is_pinned);
  const overConnectedDocuments = nodes.filter((node) => node.kind === "document" && node.degree >= 4);
  const thinClusters = clusters.filter((cluster) => cluster.documents.length < 2);
  const staleClusters = clusters.filter((cluster) => cluster.documents.length > 0 && cluster.documents.every(isStaleNode));
  const insightRows = [
    { label: "Isolated topics", value: isolatedTopics.length, nodes: isolatedTopics },
    { label: "Pinned topics", value: pinnedTopics.length, nodes: pinnedTopics },
    { label: "Over-connected docs", value: overConnectedDocuments.length, nodes: overConnectedDocuments },
    { label: "Thin clusters", value: thinClusters.length, nodes: thinClusters.map((cluster) => nodes.find((node) => node.id === cluster.topic.id)).filter((node): node is PositionedNode => Boolean(node)) },
    { label: "Stale clusters", value: staleClusters.length, nodes: staleClusters.map((cluster) => nodes.find((node) => node.id === cluster.topic.id)).filter((node): node is PositionedNode => Boolean(node)) },
  ];

  return (
    <div className="space-y-3">
      {insightRows.map((row) => (
        <div key={row.label} className="rounded-lg border border-white/10 bg-black/35 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-jetbrains text-xs uppercase tracking-[0.14em] text-neutral-500">{row.label}</span>
            <span className="text-lg font-medium text-white">{row.value}</span>
          </div>
          {row.nodes.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {row.nodes.slice(0, 4).map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectNode(node)}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-neutral-300 transition hover:border-white/25 hover:text-white"
                >
                  {node.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function isStaleNode(node: KnowledgeGraphNode) {
  const value = node.updated_at ?? node.created_at;
  if (!value) return false;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp > 1000 * 60 * 60 * 24 * 180;
}
