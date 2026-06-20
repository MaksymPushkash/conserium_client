import { afterEach, describe, expect, it, vi } from "vitest";

import { listDocuments, searchDocuments } from "@/lib/api/documents";

vi.mock("@/lib/api/generated/client", () => ({
  apiClient: {
    GET: vi.fn(),
  },
  unwrapApiResponse: vi.fn((result: { data?: unknown }) => result.data),
}));

import { apiClient } from "@/lib/api/generated/client";

const apiClientMock = vi.mocked(apiClient);

describe("documents api", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls the semantic document search endpoint with filters", async () => {
    apiClientMock.GET.mockResolvedValueOnce({
      data: { items: [], query: "parallel requests", total: 0, limit: 20 },
      response: new Response(),
    });

    await searchDocuments({
      query: "parallel requests",
      limit: 20,
      type: "URL",
      status: "READY",
      collection_id: "collection-1",
      tag: "python",
    });

    expect(apiClientMock.GET).toHaveBeenCalledWith("/api/v1/documents/search", {
      params: {
        query: {
          query: "parallel requests",
          limit: 20,
          type: "URL",
          status: "READY",
          collection_id: "collection-1",
          tag: "python",
        },
      },
    });
  });

  it("passes document list filters to the generated client", async () => {
    apiClientMock.GET.mockResolvedValueOnce({
      data: { items: [], total: 0, limit: 20, offset: 0 },
      response: new Response(),
    });

    await listDocuments({
      limit: 20,
      type: "URL",
      status: "READY",
      collection_id: "collection-1",
      tag: "python",
    });

    expect(apiClientMock.GET).toHaveBeenCalledWith("/api/v1/documents", {
      params: {
        query: {
          limit: 20,
          type: "URL",
          status: "READY",
          collection_id: "collection-1",
          tag: "python",
        },
      },
    });
  });
});
