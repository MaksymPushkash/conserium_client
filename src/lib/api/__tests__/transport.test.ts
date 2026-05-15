import { afterEach, describe, expect, it, vi } from "vitest";

import { request } from "@/lib/api";
import { errorMessage } from "@/lib/api/transport";
import { useAuthStore } from "@/stores/auth-store";

describe("api request transport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearSession();
  });

  it("refreshes an expired access token and retries once", async () => {
    useAuthStore.getState().setSession("old-access");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "expired" }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "new-access" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(request<{ ok: boolean }>("/documents")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(useAuthStore.getState().accessToken).toBe("new-access");
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringContaining("/auth/refresh"), expect.objectContaining({ credentials: "include" }));
  });

  it("reports API reachability errors with the configured target", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    try {
      await request("/ingest", { method: "POST", body: "{}" });
      throw new Error("request should fail");
    } catch (error) {
      expect(errorMessage(error)).toMatch(/^Unable to reach API at/);
    }
  });
});
