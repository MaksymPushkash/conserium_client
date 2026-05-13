"use client";

import { Sparkles, Upload } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/stores/chat-store";

interface MessageListProps {
  messages: ChatMessage[];
  hasReadyDocuments: boolean;
  suggestionChips: string[];
  onPickSuggestion: (suggestion: string) => void;
}

export function MessageList({ messages, hasReadyDocuments, suggestionChips, onPickSuggestion }: MessageListProps) {
  return (
    <div className="flex-1 overflow-auto px-5 py-8">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-end gap-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[82%] rounded-xl border px-4 py-3 text-sm font-light leading-6",
              message.role === "user"
                ? "ml-auto border-white bg-white text-black shadow-[0_0_36px_rgba(255,255,255,0.08)]"
                : "mr-auto border-white/10 bg-white/[0.035] text-neutral-100",
            )}
          >
            <div className="whitespace-pre-wrap">{message.content || "..."}</div>
            {message.sources?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.sources.map((source, index) => {
                  const citation = source.citation ?? `[${index + 1}]`;
                  return (
                    <a
                      key={source.chunk_id}
                      href={`#source-${citation.replace(/\D/g, "")}`}
                      className="font-jetbrains rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs font-light text-neutral-300 transition-colors hover:border-white/30 hover:text-white"
                    >
                      {citation} {source.document_title ?? "source"}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
        {!messages.length ? (
          <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Sparkles className="h-4 w-4 text-neutral-300" />
            </div>
            <h2 className="text-4xl font-light tracking-normal text-white">Ask about your documents.</h2>
            <p className="font-jetbrains mt-4 max-w-xl text-sm font-light leading-6 text-neutral-500">
              Use the selected collection to keep retrieval scoped. Start with a document summary, a tag, or a collection question.
            </p>
            {hasReadyDocuments ? (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {suggestionChips.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onPickSuggestion(suggestion)}
                    className="font-jetbrains rounded-full border border-white/10 px-3 py-1.5 text-xs font-light text-neutral-500 transition-colors hover:border-white/30 hover:text-neutral-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <Link href="/ingest" className="mt-8 inline-flex">
                <Button className="font-normal">
                  <Upload className="h-4 w-4" />
                  Add your first source
                </Button>
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
