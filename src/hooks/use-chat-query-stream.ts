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
          suggestedFollowUpQuestions: result.suggested_follow_up_questions,
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
            sources = querySourcesFromStream(event.data.sources);
            updateMessage(assistantMessageId, { sources });
          }
          if (event.event === "debug") {
            const nextDebug = queryDebugFromStream(event.data);
            if (nextDebug) {
              debug = nextDebug;
              updateMessage(assistantMessageId, { debug });
            }
          }
          if (event.event === "refrag_context") {
            const nextRefragContext = refragContextFromStream(event.data);
            if (nextRefragContext) {
              refragContext = nextRefragContext;
              updateMessage(assistantMessageId, { refragContext });
            }
          }
          if (event.event === "done") {
            updateMessage(assistantMessageId, {
              sources,
              refragContext,
              debug,
              evalScores: isRecord(event.data.eval_scores) ? event.data.eval_scores : undefined,
              traceId: typeof event.data.trace_id === "string" ? event.data.trace_id : null,
              suggestedFollowUpQuestions: Array.isArray(event.data.suggested_follow_up_questions)
                ? event.data.suggested_follow_up_questions.filter((item): item is string => typeof item === "string")
                : [],
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

function querySourcesFromStream(value: unknown): QuerySource[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(querySourceFromStream).filter((source): source is QuerySource => source !== null);
}

function querySourceFromStream(value: unknown): QuerySource | null {
  if (!isRecord(value)) {
    return null;
  }
  const chunkId = stringField(value, "chunk_id");
  const documentId = stringField(value, "document_id");
  const content = stringField(value, "content");
  const citation = stringField(value, "citation");
  const chunkIndex = numberField(value, "chunk_index");
  if (!chunkId || !documentId || !content || !citation || chunkIndex === null) {
    return null;
  }
  return {
    chunk_id: chunkId,
    document_id: documentId,
    content,
    citation,
    chunk_index: chunkIndex,
    document_title: nullableStringField(value, "document_title"),
    page_number: nullableNumberField(value, "page_number"),
    score: nullableNumberField(value, "score"),
    used_in_answer: value.used_in_answer === true,
  };
}

function queryDebugFromStream(value: unknown): QueryDebug | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const originalQuery = stringField(value, "original_query");
  const retrievalQuery = stringField(value, "retrieval_query");
  if (!originalQuery || !retrievalQuery) {
    return undefined;
  }
  return {
    original_query: originalQuery,
    retrieval_query: retrievalQuery,
    selected_collection_id: nullableStringField(value, "selected_collection_id"),
    selected_tags: stringArrayField(value, "selected_tags"),
    promoted_document_ids: stringArrayField(value, "promoted_document_ids"),
    retrieved_sources: querySourcesFromStream(value.retrieved_sources),
    final_sources: querySourcesFromStream(value.final_sources),
    used_sources: querySourcesFromStream(value.used_sources),
    filtered_sources: querySourcesFromStream(value.filtered_sources),
  };
}

function refragContextFromStream(value: unknown): RefragContext | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const compressionStrategy = stringField(value, "compression_strategy");
  const totalContextTokens = numberField(value, "total_context_tokens");
  const totalOriginalTokens = numberField(value, "total_original_tokens");
  if (!compressionStrategy || totalContextTokens === null || totalOriginalTokens === null) {
    return undefined;
  }
  return {
    compression_strategy: compressionStrategy,
    total_context_tokens: totalContextTokens,
    total_original_tokens: totalOriginalTokens,
    compressed_chunks: refragChunksFromStream(value.compressed_chunks),
    discarded_chunks: refragChunksFromStream(value.discarded_chunks),
    full_text_chunks: refragChunksFromStream(value.full_text_chunks),
  };
}

function refragChunksFromStream(value: unknown): RefragContext["full_text_chunks"] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(refragChunkFromStream).filter((chunk): chunk is RefragContext["full_text_chunks"][number] => chunk !== null);
}

function refragChunkFromStream(value: unknown): RefragContext["full_text_chunks"][number] | null {
  if (!isRecord(value)) {
    return null;
  }
  const chunkId = stringField(value, "chunk_id");
  const documentId = stringField(value, "document_id");
  const contextText = stringField(value, "context_text");
  const chunkIndex = numberField(value, "chunk_index");
  const contextTokenCount = numberField(value, "context_token_count");
  const originalTokenCount = numberField(value, "original_token_count");
  if (
    !chunkId ||
    !documentId ||
    !contextText ||
    chunkIndex === null ||
    contextTokenCount === null ||
    originalTokenCount === null
  ) {
    return null;
  }
  return {
    chunk_id: chunkId,
    document_id: documentId,
    context_text: contextText,
    chunk_index: chunkIndex,
    context_token_count: contextTokenCount,
    original_token_count: originalTokenCount,
    citation: nullableStringField(value, "citation"),
    document_title: nullableStringField(value, "document_title"),
    page_number: nullableNumberField(value, "page_number"),
    representation: refragRepresentation(value.representation),
    score: nullableNumberField(value, "score"),
  };
}

function refragRepresentation(value: unknown): RefragContext["full_text_chunks"][number]["representation"] {
  if (value === "COMPRESSED" || value === "DISCARDED") {
    return value;
  }
  return "FULL_TEXT";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(value: Record<string, unknown>, key: string): string | null {
  const field = value[key];
  return typeof field === "string" ? field : null;
}

function nullableStringField(value: Record<string, unknown>, key: string): string | null {
  const field = value[key];
  return typeof field === "string" ? field : null;
}

function numberField(value: Record<string, unknown>, key: string): number | null {
  const field = value[key];
  return typeof field === "number" ? field : null;
}

function nullableNumberField(value: Record<string, unknown>, key: string): number | null {
  const field = value[key];
  return typeof field === "number" ? field : null;
}

function stringArrayField(value: Record<string, unknown>, key: string): string[] {
  const field = value[key];
  return Array.isArray(field) ? field.filter((item): item is string => typeof item === "string") : [];
}
