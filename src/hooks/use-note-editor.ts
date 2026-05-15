"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { findSlashRange, slashCommands } from "@/components/notes/slash-commands";
import type { SlashCommand, SlashRange } from "@/components/notes/slash-commands";

interface UseNoteEditorOptions {
  content: string;
  setContent: (content: string) => void;
  onImageCommand: (range: SlashRange) => void;
}

export function useNoteEditor({ content, setContent, onImageCommand }: UseNoteEditorOptions) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [slashRange, setSlashRange] = useState<SlashRange | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);

  const filteredSlashCommands = useMemo(() => {
    if (!slashRange) return [];
    if (!slashRange.query) return slashCommands;
    return slashCommands.filter((command) => {
      const haystack = `${command.label} ${command.shortcut}`.toLowerCase();
      return haystack.includes(slashRange.query);
    });
  }, [slashRange]);

  useEffect(() => {
    setSlashIndex(0);
  }, [slashRange?.query]);

  function setCaret(position: number) {
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(position, position);
    });
  }

  function insertTextAtRange(text: string, range: SlashRange, cursorOffset = text.length) {
    const next = `${content.slice(0, range.start)}${text}${content.slice(range.end)}`;
    setContent(next);
    setSlashRange(null);
    setCaret(range.start + cursorOffset);
  }

  function runSlashCommand(command: SlashCommand) {
    if (!slashRange) return;
    if (command.imageUpload) {
      onImageCommand(slashRange);
      setSlashRange(null);
      return;
    }
    const replacement = command.createReplacement?.(content);
    if (!replacement) return;
    insertTextAtRange(replacement.text, slashRange, replacement.cursorOffset ?? replacement.text.length);
  }

  function onContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    const cursor = event.target.selectionStart;
    setContent(next);
    setSlashRange(findSlashRange(next, cursor));
  }

  function onContentKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!slashRange || !filteredSlashCommands.length) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setSlashRange(null);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSlashIndex((index) => (index + 1) % filteredSlashCommands.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSlashIndex((index) => (index - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      runSlashCommand(filteredSlashCommands[slashIndex] ?? filteredSlashCommands[0]);
    }
  }

  return {
    textareaRef,
    slashRange,
    slashIndex,
    filteredSlashCommands,
    insertTextAtRange,
    onContentChange,
    onContentKeyDown,
    runSlashCommand,
  };
}
