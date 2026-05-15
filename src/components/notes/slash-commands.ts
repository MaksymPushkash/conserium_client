"use client";

import { Code2, FileText, Heading1, Heading2, Heading3, ImagePlus, List, ListOrdered, Minus, Quote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SlashRange = {
  start: number;
  end: number;
  query: string;
};

export type SlashCommand = {
  id: string;
  label: string;
  shortcut: string;
  icon: LucideIcon;
  createReplacement?: (content: string) => { text: string; cursorOffset?: number };
  imageUpload?: true;
};

export const slashCommands: SlashCommand[] = [
  { id: "h1", label: "Heading 1", shortcut: "H1", icon: Heading1, createReplacement: () => ({ text: "# " }) },
  { id: "h2", label: "Heading 2", shortcut: "H2", icon: Heading2, createReplacement: () => ({ text: "## " }) },
  { id: "h3", label: "Heading 3", shortcut: "H3", icon: Heading3, createReplacement: () => ({ text: "### " }) },
  { id: "bullet", label: "Bullet List", shortcut: "-", icon: List, createReplacement: () => ({ text: "- " }) },
  { id: "ordered", label: "Ordered List", shortcut: "1.", icon: ListOrdered, createReplacement: () => ({ text: "1. " }) },
  { id: "quote", label: "Quote", shortcut: ">", icon: Quote, createReplacement: () => ({ text: "> " }) },
  { id: "code", label: "Code Block", shortcut: "</>", icon: Code2, createReplacement: () => ({ text: "```\n\n```", cursorOffset: 4 }) },
  { id: "divider", label: "Divider", shortcut: "-", icon: Minus, createReplacement: () => ({ text: "---" }) },
  { id: "image", label: "Image Upload", shortcut: "img", icon: ImagePlus, imageUpload: true },
  {
    id: "toc",
    label: "Table of Contents",
    shortcut: "toc",
    icon: FileText,
    createReplacement: (content) => ({ text: buildTableOfContents(content) }),
  },
];

export function buildTableOfContents(content: string) {
  const headings = content
    .split("\n")
    .map((line) => line.match(/^(#{1,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const depth = match[1].length;
      const label = match[2].trim();
      return `${"  ".repeat(depth - 1)}- ${label}`;
    });
  return headings.length ? headings.join("\n") : "- Add headings to build a table of contents";
}

export function findSlashRange(value: string, cursor: number): SlashRange | null {
  const lineStart = value.lastIndexOf("\n", cursor - 1) + 1;
  const lastSpace = value.lastIndexOf(" ", cursor - 1);
  const tokenStart = Math.max(lineStart, lastSpace + 1);
  const token = value.slice(tokenStart, cursor);
  if (!token.startsWith("/") || token.includes("\n")) return null;
  return { start: tokenStart, end: cursor, query: token.slice(1).toLowerCase() };
}
