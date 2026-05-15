"use client";

import type { SlashCommand } from "@/components/notes/slash-commands";
import { cn } from "@/lib/utils";

interface NoteSlashMenuProps {
  commands: SlashCommand[];
  activeIndex: number;
  onRun: (command: SlashCommand) => void;
}

export function NoteSlashMenu({ commands, activeIndex, onRun }: NoteSlashMenuProps) {
  return (
    <div className="absolute left-0 top-36 z-20 w-80 rounded-xl border border-white/10 bg-black/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      {commands.length ? (
        commands.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                index === activeIndex ? "bg-white/[0.12] text-white" : "text-neutral-400 hover:bg-white/[0.06] hover:text-white",
              )}
              onMouseDown={(event) => {
                event.preventDefault();
                onRun(command);
              }}
            >
              <span className="font-jetbrains w-8 shrink-0 text-xs font-light text-neutral-500">{command.shortcut}</span>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-light">{command.label}</span>
            </button>
          );
        })
      ) : (
        <div className="font-jetbrains px-3 py-2 text-xs font-light text-neutral-600">No commands found.</div>
      )}
    </div>
  );
}
