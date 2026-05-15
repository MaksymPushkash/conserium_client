"use client";

import type { ChangeEvent, KeyboardEvent, ReactNode, RefObject } from "react";

import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { NoteSlashMenu } from "@/components/notes/note-slash-menu";
import type { SlashCommand, SlashRange } from "@/components/notes/slash-commands";

export type NoteEditorMode = "edit" | "preview";

interface NoteEditorProps {
  selected: boolean;
  title: string;
  content: string;
  mode: NoteEditorMode;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  imageInputRef: RefObject<HTMLInputElement | null>;
  slashRange: SlashRange | null;
  slashIndex: number;
  slashCommands: SlashCommand[];
  onTitleChange: (title: string) => void;
  onContentChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onContentKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onImageInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRunSlashCommand: (command: SlashCommand) => void;
  emptyState: ReactNode;
}

export function NoteEditor({
  selected,
  title,
  content,
  mode,
  textareaRef,
  imageInputRef,
  slashRange,
  slashIndex,
  slashCommands,
  onTitleChange,
  onContentChange,
  onContentKeyDown,
  onImageInputChange,
  onRunSlashCommand,
  emptyState,
}: NoteEditorProps) {
  if (!selected) {
    return emptyState;
  }

  return (
    <div className="relative mx-auto flex min-h-full max-w-4xl flex-col">
      {mode === "edit" ? (
        <>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-3xl font-light tracking-normal text-white outline-none placeholder:text-neutral-800"
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={onContentChange}
            onKeyDown={onContentKeyDown}
            placeholder="Write your thoughts..."
            spellCheck
            className="mt-10 min-h-[62vh] w-full resize-none bg-transparent text-base font-light leading-8 text-neutral-100 outline-none placeholder:text-neutral-700"
          />
        </>
      ) : (
        <MarkdownPreview title={title} content={content} />
      )}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={onImageInputChange} />
      {mode === "edit" && slashRange ? <NoteSlashMenu commands={slashCommands} activeIndex={slashIndex} onRun={onRunSlashCommand} /> : null}
    </div>
  );
}
