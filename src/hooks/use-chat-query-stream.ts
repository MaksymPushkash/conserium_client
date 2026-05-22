"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { queryDocuments, streamQueryDocuments } from "@/lib/api";
import type { QueryDebug, QuerySource, RefragContext } from "@/lib/types";
import type { ChatMessage } from "@/stores/chat-store";

interface UseChatQueryStreamOptions {
  conversationId: string | null;
  collectionId: string | null;
  documentId?: string | null;
  tagName: string | null;
  streaming: boolean;
  setConversationId: (conversationId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
}

export function useChatQueryStream({
  conversationId,
  collectionId,
  documentId = null,
  tagName,
  streaming,
  setConversationId,
  addMessage,
  updateMessage,
}: UseChatQueryStreamOptions) {
  const queryClient = useQueryClient();
  const controllerRef = useRef<AbortController | null>(null);
  const syncMutation = useMutation({ mutationFn: queryDocuments });

  function abortQuery() {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }

  async function submitQuery(text: string) {
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    addMessage({ id: userMessageId, role: "user", content: text });
    addMessage({ id: assistantMessageId, role: "assistant", content: "" });

    if (!streaming) {
      try {
        const result = await syncMutation.mutateAsync({
          query: text,
          conversation_id: conversationId,
          collection_id: collectionId,
          document_id: documentId,
          tag_names: tagName ? [tagName] : null,
          limit: 5,
        });
        setConversationId(result.conversation_id);
        updateMessage(assistantMessageId, {
          content: result.answer,
          sources: result.sources,
          refragContext: result.refrag_context,
          debug: result.debug ?? undefined,
        });
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
        await queryClient.invalidateQueries({ queryKey: ["chats", result.conversation_id] });
      } catch (error) {
        updateMessage(assistantMessageId, { content: error instanceof Error ? error.message : "Query failed" });
      }
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    let answer = "";
    let sources: QuerySource[] = [];
    let refragContext: RefragContext | undefined;
    let debug: QueryDebug | undefined;
    let activeConversationId = conversationId;
    let streamErrorMessage: string | null = null;

    try {
      await streamQueryDocuments(
        {
          query: text,
          conversation_id: conversationId,
          collection_id: collectionId,
          document_id: documentId,
          tag_names: tagName ? [tagName] : null,
          limit: 5,
        },
        async (event) => {
          if (event.event === "metadata") {
            const nextConversationId = event.data.conversation_id;
            if (typeof nextConversationId === "string") {
              activeConversationId = nextConversationId;
              setConversationId(nextConversationId);
            }
          }
          if (event.event === "token") {
            const token = typeof event.data.text === "string" ? event.data.text : "";
            answer += token;
            updateMessage(assistantMessageId, { content: answer });
          }
          if (event.event === "sources" && Array.isArray(event.data.sources)) {
            sources = event.data.sources as QuerySource[];
            updateMessage(assistantMessageId, { sources });
          }
          if (event.event === "debug") {
            debug = event.data as unknown as QueryDebug;
            updateMessage(assistantMessageId, { debug });
          }
          if (event.event === "refrag_context") {
            refragContext = event.data as unknown as RefragContext;
            updateMessage(assistantMessageId, { refragContext });
          }
          if (event.event === "done") {
            updateMessage(assistantMessageId, {
              sources,
              refragContext,
              debug,
              evalScores: event.data.eval_scores as Record<string, unknown> | undefined,
              traceId: typeof event.data.trace_id === "string" ? event.data.trace_id : null,
            });
            await queryClient.invalidateQueries({ queryKey: ["chats"] });
            if (activeConversationId) {
              await queryClient.invalidateQueries({ queryKey: ["chats", activeConversationId] });
            }
          }
          if (event.event === "error") {
            streamErrorMessage = String(event.data.message ?? "Stream failed");
            updateMessage(assistantMessageId, { content: streamErrorMessage });
          }
        },
        controller.signal,
      );
    } catch (error) {
      updateMessage(assistantMessageId, { content: streamErrorMessage ?? (error instanceof Error ? error.message : "Stream failed") });
    } finally {
      controllerRef.current = null;
    }
  }

  return { submitQuery, abortQuery, isSyncPending: syncMutation.isPending };
}
