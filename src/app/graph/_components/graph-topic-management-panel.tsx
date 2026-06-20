import { Pin, PinOff, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";

import type { PositionedNode } from "./graph-types";

export function TopicManagementPanel({
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
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-3 text-sm font-medium text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {confirmIgnore ? "Confirm ignore" : "Ignore topic"}
        <ShieldOff className="h-4 w-4" />
      </button>
      {error ? <p className="mt-2 text-sm text-neutral-400">{error}</p> : null}
    </div>
  );
}
