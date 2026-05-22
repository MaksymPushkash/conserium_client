"use client";

import { Sparkles, Upload } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/ui/citation-card";
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
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-end gap-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[86%] rounded-2xl border px-4 py-3 text-sm font-light leading-6 transition-all duration-200",
              message.role === "user"
                ? "ml-auto border-white bg-white text-black shadow-[0_0_36px_rgba(255,255,255,0.08)]"
                : "mr-auto border-white/10 bg-white/[0.045] text-neutral-100 shadow-xl shadow-black/20",
            )}
          >
            <div className={cn("whitespace-pre-wrap", message.role === "assistant" && "prose prose-invert prose-neutral max-w-none prose-p:my-2 prose-li:my-1")}>
              {message.content || "..."}
            </div>
            {message.sources?.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {message.sources.map((source, index) => {
                  const citation = source.citation ?? `[${index + 1}]`;
                  const citationNumber = Number(citation.replace(/\D/g, "")) || index + 1;
                  return (
                    <CitationCard
                      key={source.chunk_id}
                      index={citationNumber}
                      title={source.document_title ?? "Source"}
                      detail={sourceDetail(source)}
                      excerpt={source.content}
                      href={`#source-${citationNumber}`}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
        {!messages.length ? (
          <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Sparkles className="h-4 w-4 text-neutral-300" />
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">Ask Cortex anything across your sources.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">
              Answers cite saved documents. Scope by collection when you need tighter retrieval.
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

function sourceDetail(source: NonNullable<ChatMessage["sources"]>[number]) {
  const page = source.page_number ? `page ${source.page_number}` : `chunk ${source.chunk_index}`;
  const confidence = source.score !== null ? `score ${source.score.toFixed(3)}` : "score n/a";
  return `${page} · ${confidence}`;
}
