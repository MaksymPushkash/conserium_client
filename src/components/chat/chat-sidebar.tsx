"use client";

import { MessageSquare, Plus } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChatSession } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  chats: ChatSession[];
  conversationId: string | null;
  topicTitle: string;
  createPending: boolean;
  onTopicTitleChange: (value: string) => void;
  onCreateTopic: (event: FormEvent) => void;
  onTemporaryChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  conversationId,
  topicTitle,
  createPending,
  onTopicTitleChange,
  onCreateTopic,
  onTemporaryChat,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 space-y-4">
        <Card className="border-white/10 bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={onCreateTopic} className="space-y-2">
              <Input
                value={topicTitle}
                onChange={(event) => onTopicTitleChange(event.target.value)}
                placeholder="New topic"
                className="font-jetbrains text-sm font-light"
              />
              <Button type="submit" className="w-full font-normal" disabled={createPending}>
                <Plus className="h-4 w-4" />
                Create chat
              </Button>
            </form>
            <Button variant="secondary" className="w-full font-normal" onClick={onTemporaryChat}>
              <MessageSquare className="h-4 w-4" />
              Temporary chat
            </Button>
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    chat.id === conversationId
                      ? "border-white/20 bg-white/[0.08]"
                      : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.03]",
                  )}
                >
                  <div className="truncate text-sm font-normal text-white">{chat.title}</div>
                  <div className="font-jetbrains mt-1 text-xs font-light text-neutral-500">{chat.message_count} messages</div>
                </button>
              ))}
              {!chats.length ? (
                <div className="font-jetbrains rounded-lg border border-white/10 px-3 py-4 text-xs font-light leading-5 text-neutral-500">
                  Create a topic chat or ask a question to start one.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
