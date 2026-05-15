import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useChatQueryStream } from "@/hooks/use-chat-query-stream";
import { queryDocuments, streamQueryDocuments } from "@/lib/api";
import type { QueryStreamEvent } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  queryDocuments: vi.fn(),
  streamQueryDocuments: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
}

function renderChatHook(options: Partial<Parameters<typeof useChatQueryStream>[0]> = {}) {
  const addMessage = vi.fn();
  const updateMessage = vi.fn();
  const setConversationId = vi.fn();
  const result = renderHook(
    () =>
      useChatQueryStream({
        conversationId: null,
        collectionId: null,
        tagName: null,
        streaming: true,
        setConversationId,
        addMessage,
        updateMessage,
        ...options,
      }),
    { wrapper },
  );
  return { ...result, addMessage, updateMessage, setConversationId };
}

describe("useChatQueryStream", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("streams answer tokens and final metadata", async () => {
    vi.mocked(streamQueryDocuments).mockImplementation(async (_payload, onEvent) => {
      const events: QueryStreamEvent[] = [
        { event: "metadata", data: { conversation_id: "chat-1" } },
        { event: "token", data: { text: "Hello" } },
        { event: "token", data: { text: " world" } },
        { event: "sources", data: { sources: [{ chunk_id: "chunk-1" }] } },
        { event: "done", data: { eval_scores: { faithfulness: 1 }, trace_id: "trace-1" } },
      ];
      for (const event of events) {
        onEvent(event);
      }
      return { query_id: "query-1", conversation_id: "chat-1", eval_scores: { faithfulness: 1 }, trace_id: "trace-1" };
    });
    const { result, addMessage, updateMessage, setConversationId } = renderChatHook();

    await act(async () => {
      await result.current.submitQuery("hello");
    });

    expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({ role: "user", content: "hello" }));
    expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({ role: "assistant", content: "" }));
    expect(setConversationId).toHaveBeenCalledWith("chat-1");
    expect(updateMessage).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ content: "Hello world" }));
    expect(updateMessage).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ evalScores: { faithfulness: 1 }, traceId: "trace-1" }));
  });

  it("shows backend stream error messages", async () => {
    vi.mocked(streamQueryDocuments).mockImplementation(async (_payload, onEvent) => {
      onEvent({ event: "error", data: { message: "backend exploded" } });
      throw new Error("backend exploded");
    });
    const { result, updateMessage } = renderChatHook();

    await act(async () => {
      await result.current.submitQuery("hello");
    });

    expect(updateMessage).toHaveBeenCalledWith(expect.any(String), { content: "backend exploded" });
  });

  it("keeps backend stream error after partial tokens", async () => {
    vi.mocked(streamQueryDocuments).mockImplementation(async (_payload, onEvent) => {
      onEvent({ event: "token", data: { text: "partial answer" } });
      onEvent({ event: "error", data: { message: "specific backend error" } });
      throw new Error("generic stream failure");
    });
    const { result, updateMessage } = renderChatHook();

    await act(async () => {
      await result.current.submitQuery("hello");
    });

    expect(updateMessage).toHaveBeenCalledWith(expect.any(String), { content: "partial answer" });
    expect(updateMessage).toHaveBeenLastCalledWith(expect.any(String), { content: "specific backend error" });
  });

  it("shows stream network failures", async () => {
    vi.mocked(streamQueryDocuments).mockRejectedValue(new Error("Unable to reach API"));
    const { result, updateMessage } = renderChatHook();

    await act(async () => {
      await result.current.submitQuery("hello");
    });

    expect(updateMessage).toHaveBeenLastCalledWith(expect.any(String), { content: "Unable to reach API" });
  });

  it("aborts an active stream", async () => {
    let streamSignal: AbortSignal | undefined;
    vi.mocked(streamQueryDocuments).mockImplementation((_payload, _onEvent, signal) => {
      streamSignal = signal;
      return new Promise((resolve) => {
        signal?.addEventListener("abort", () => resolve(null));
      });
    });
    const { result } = renderChatHook();

    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.submitQuery("hello");
    });
    act(() => {
      result.current.abortQuery();
    });
    await act(async () => {
      await pending;
    });

    expect(streamSignal?.aborted).toBe(true);
  });

  it("uses sync query when streaming is disabled", async () => {
    vi.mocked(queryDocuments).mockResolvedValue({
      conversation_id: "chat-sync",
      query: "hello",
      answer: "sync answer",
      sources: [],
      refrag_context: {
        full_text_chunks: [],
        compressed_chunks: [],
        discarded_chunks: [],
        total_original_tokens: 0,
        total_context_tokens: 0,
        compression_strategy: "none",
      },
      debug: null,
    });
    const { result, updateMessage, setConversationId } = renderChatHook({ streaming: false });

    await act(async () => {
      await result.current.submitQuery("hello");
    });

    expect(queryDocuments).toHaveBeenCalledWith(expect.objectContaining({ query: "hello" }), expect.any(Object));
    expect(streamQueryDocuments).not.toHaveBeenCalled();
    expect(setConversationId).toHaveBeenCalledWith("chat-sync");
    expect(updateMessage).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ content: "sync answer" }));
  });
});
