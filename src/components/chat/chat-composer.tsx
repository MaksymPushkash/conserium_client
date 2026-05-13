"use client";

import { Send } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function ChatComposer({ query, onQueryChange, onSubmit }: ChatComposerProps) {
  return (
    <form onSubmit={onSubmit} className="border-t border-white/10 p-4">
      <div className="mx-auto flex max-w-4xl gap-3 rounded-xl border border-white/10 bg-black p-2 shadow-[0_-20px_60px_rgba(0,0,0,0.35)]">
        <Textarea
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ask about this topic..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          className="font-jetbrains min-h-12 resize-none border-0 bg-transparent px-2 text-white placeholder:text-neutral-600 focus-visible:ring-0"
        />
        <Button size="icon" disabled={!query.trim()} className="mt-auto h-11 w-11 rounded-lg">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
