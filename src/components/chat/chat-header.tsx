"use client";

import { Bug, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEBUG_UI_ENABLED } from "@/lib/config";
import type { Collection } from "@/lib/types";

interface ChatHeaderProps {
  title: string;
  conversationId: string | null;
  collectionId: string | null;
  tagName: string | null;
  collections: Collection[];
  availableTags: string[];
  streaming: boolean;
  debugOpen: boolean;
  onCollectionChange: (collectionId: string | null) => void;
  onTagChange: (tagName: string | null) => void;
  onStreamingChange: (streaming: boolean) => void;
  onDebugOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export function ChatHeader({
  title,
  conversationId,
  collectionId,
  tagName,
  collections,
  availableTags,
  streaming,
  debugOpen,
  onCollectionChange,
  onTagChange,
  onStreamingChange,
  onDebugOpenChange,
  onReset,
}: ChatHeaderProps) {
  const collectionName = collections.find((collection) => collection.id === collectionId)?.name ?? "all";

  return (
    <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-normal tracking-normal text-white">{title}</h1>
        <div className="font-jetbrains mt-1 text-xs font-light text-neutral-500">
          conversation {conversationId ?? "new"} · collection {collectionName} · tag {tagName ?? "all"}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none"
          value={collectionId ?? ""}
          onChange={(event) => onCollectionChange(event.target.value || null)}
        >
          <option value="" className="bg-black text-neutral-200">All collections</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id} className="bg-black text-neutral-200">
              {collection.name}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-white/10 bg-white/[0.03] px-3 text-sm text-neutral-300 outline-none"
          value={tagName ?? ""}
          onChange={(event) => onTagChange(event.target.value || null)}
        >
          <option value="" className="bg-black text-neutral-200">All tags</option>
          {availableTags.map((availableTag) => (
            <option key={availableTag} value={availableTag} className="bg-black text-neutral-200">
              {availableTag}
            </option>
          ))}
        </select>
        <Button
          variant={streaming ? "default" : "secondary"}
          size="sm"
          onClick={() => onStreamingChange(!streaming)}
          className="font-normal"
        >
          {streaming ? "Streaming" : "Sync"}
        </Button>
        {DEBUG_UI_ENABLED ? (
          <Button variant="secondary" size="sm" onClick={() => onDebugOpenChange(!debugOpen)} className="font-normal">
            <Bug className="h-4 w-4" />
            Debug
          </Button>
        ) : null}
        <Button variant="ghost" size="icon" onClick={onReset} aria-label="Reset conversation">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
