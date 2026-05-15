import { afterEach, describe, expect, it, vi } from "vitest";

import { parseQueryStreamEvent, streamQueryDocuments } from "@/lib/api/query";
import { useAuthStore } from "@/stores/auth-store";

function streamResponse(payload: string, status = 200) {
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(payload));
      controller.close();
    },
  }), { status });
}

describe("query stream parser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearSession();
  });

  it("parses SSE data events", () => {
    expect(parseQueryStreamEvent('event: token\ndata: {"event":"token","data":{"text":"hello"}}')).toEqual({
      event: "token",
      data: { text: "hello" },
    });
  });

  it("ignores done sentinels", () => {
    expect(parseQueryStreamEvent("data: [DONE]")).toBeNull();
  });

  it("refreshes an expired access token before streaming", async () => {
    useAuthStore.getState().setSession("old-access");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "expired" }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "new-access" }), { status: 200 }))
      .mockResolvedValueOnce(streamResponse('data: {"event":"done","data":{"query_id":"q1","conversation_id":"c1","eval_scores":{},"trace_id":null}}\n\n'));
    vi.stubGlobal("fetch", fetchMock);

    const result = await streamQueryDocuments({ query: "hello", limit: 5 }, vi.fn());

    expect(result).toEqual({ query_id: "q1", conversation_id: "c1", eval_scores: {}, trace_id: null });
    expect(useAuthStore.getState().accessToken).toBe("new-access");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(3, expect.stringContaining("/query/stream"), expect.objectContaining({
      headers: expect.any(Headers),
      credentials: "include",
    }));
    expect((fetchMock.mock.calls[2][1].headers as Headers).get("Authorization")).toBe("Bearer new-access");
  });

  it("clears session when stream token refresh fails", async () => {
    useAuthStore.getState().setSession("old-access");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "expired" }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "refresh expired" }), { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(streamQueryDocuments({ query: "hello", limit: 5 }, vi.fn())).rejects.toMatchObject({
      status: 401,
      detail: { detail: "expired" },
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
