import { afterEach, describe, expect, it, vi } from "vitest";

import { searchDocuments } from "@/lib/api/documents";

vi.mock("@/lib/api/transport", () => ({
  request: vi.fn(),
}));

import { request } from "@/lib/api/transport";

const requestMock = vi.mocked(request);

describe("documents api", () => {
  afterEach(() => {
    requestMock.mockReset();
  });

  it("calls the semantic document search endpoint with filters", async () => {
    requestMock.mockResolvedValueOnce({ items: [], query: "parallel requests", total: 0, limit: 20 });

    await searchDocuments({
      query: "parallel requests",
      limit: 20,
      type: "URL",
      status: "READY",
      collection_id: "collection-1",
      tag: "python",
    });

    expect(requestMock).toHaveBeenCalledWith(
      "/documents/search?query=parallel+requests&limit=20&type=URL&status=READY&collection_id=collection-1&tag=python",
    );
  });
});
