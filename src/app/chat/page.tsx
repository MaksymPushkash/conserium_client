"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { MessageList } from "@/components/chat/message-list";
import { SourcePreviewDrawer } from "@/components/chat/source-preview-drawer";
import { SourcesPanel } from "@/components/chat/sources-panel";
import { useChatQueryStream } from "@/hooks/use-chat-query-stream";
import { useChatSuggestions } from "@/hooks/use-chat-suggestions";
import { createChat, getChat, listChats, listCollections, listDocuments } from "@/lib/api";
import type { ChatMessageResponse, QuerySource } from "@/lib/types";
import type { ChatMessage } from "@/stores/chat-store";
import { useChatStore } from "@/stores/chat-store";
import { useUiStore } from "@/stores/ui-store";

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tagName, setTagName] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<QuerySource | null>(null);
  const queryClient = useQueryClient();
  const { conversationId, setConversationId, messages, setMessages, addMessage, updateMessage, resetConversation } = useChatStore();
  const { debugOpen, setDebugOpen } = useUiStore();

  const chatsQuery = useQuery({ queryKey: ["chats"], queryFn: () => listChats({ limit: 50 }) });
  const collectionsQuery = useQuery({ queryKey: ["collections"], queryFn: () => listCollections({ limit: 100 }) });
  const documentsQuery = useQuery({
    queryKey: ["documents", "chat-suggestions", collectionId],
    queryFn: () => listDocuments({ limit: 20, collection_id: collectionId, status: "READY" }),
  });
  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: async (chat) => {
      setConversationId(chat.id);
      setMessages([]);
      setTopicTitle("");
      await queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const { suggestionChips, availableTags, hasReadyDocuments } = useChatSuggestions(
    collectionsQuery.data?.items,
    documentsQuery.data?.items,
  );
  const latestAssistant = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );
  const selectedChat = chatsQuery.data?.items.find((chat) => chat.id === conversationId);
  const { submitQuery, abortQuery } = useChatQueryStream({
    conversationId,
    collectionId,
    tagName,
    streaming,
    setConversationId,
    addMessage,
    updateMessage,
  });

  async function selectChat(chatId: string) {
    const detail = await queryClient.fetchQuery({
      queryKey: ["chats", chatId],
      queryFn: () => getChat(chatId),
    });
    setConversationId(chatId);
    setMessages(detail.messages.map(toChatMessage));
  }

  function startLocalNewChat() {
    abortQuery();
    resetConversation();
  }

  async function createTopic(event: FormEvent) {
    event.preventDefault();
    await createChatMutation.mutateAsync({ title: topicTitle.trim() || "New chat" });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = query.trim();
    if (!text) return;
    setQuery("");
    await submitQuery(text);
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto grid max-w-[1640px] gap-6 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <ChatSidebar
          chats={chatsQuery.data?.items ?? []}
          conversationId={conversationId}
          topicTitle={topicTitle}
          createPending={createChatMutation.isPending}
          onTopicTitleChange={setTopicTitle}
          onCreateTopic={createTopic}
          onTemporaryChat={startLocalNewChat}
          onSelectChat={(chatId) => void selectChat(chatId)}
        />

        <section className="flex min-h-[calc(100vh-48px)] flex-col rounded-xl border border-white/10 bg-white/[0.015]">
          <ChatHeader
            title={selectedChat?.title ?? "Query"}
            conversationId={conversationId}
            collectionId={collectionId}
            tagName={tagName}
            collections={collectionsQuery.data?.items ?? []}
            availableTags={availableTags}
            streaming={streaming}
            debugOpen={debugOpen}
            onCollectionChange={(nextCollectionId) => {
              setCollectionId(nextCollectionId);
              setTagName(null);
            }}
            onTagChange={setTagName}
            onStreamingChange={setStreaming}
            onDebugOpenChange={setDebugOpen}
            onReset={startLocalNewChat}
          />
          <MessageList
            messages={messages}
            hasReadyDocuments={hasReadyDocuments}
            suggestionChips={suggestionChips}
            onPickSuggestion={setQuery}
          />
          <ChatComposer query={query} onQueryChange={setQuery} onSubmit={onSubmit} />
        </section>

        <SourcesPanel latestAssistant={latestAssistant} debugOpen={debugOpen} onPreview={setPreviewSource} />
      </div>
      {previewSource ? <SourcePreviewDrawer source={previewSource} onClose={() => setPreviewSource(null)} /> : null}
    </div>
  );
}

function toChatMessage(message: ChatMessageResponse): ChatMessage {
  return {
    id: message.id,
    role: message.role === "user" || message.role === "assistant" || message.role === "system" ? message.role : "system",
    content: message.content,
    sources: message.sources ?? undefined,
    refragContext: message.refrag_context ?? undefined,
    evalScores: message.eval_scores ?? undefined,
    traceId: message.trace_id,
  };
}
