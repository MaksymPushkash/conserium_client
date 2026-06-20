import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteCurrentUser, getCurrentUser, getUserPreferences, oauthUrl, updateUserPreferences } from "@/lib/api/auth";

vi.mock("@/lib/api/generated/client", () => ({
  apiClient: {
    DELETE: vi.fn(),
    GET: vi.fn(),
    PATCH: vi.fn(),
  },
  unwrapApiResponse: vi.fn((result: { data?: unknown }) => result.data),
}));

import { apiClient } from "@/lib/api/generated/client";

const apiClientMock = vi.mocked(apiClient);

describe("auth api", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches the current user from the users endpoint", async () => {
    apiClientMock.GET.mockResolvedValueOnce({
      data: {
        id: "user-id",
        email: "user@example.com",
        display_name: null,
        is_active: true,
        preferences: {
          appearance: { theme: "dark" },
          privacy: { share_usage_data: false, retain_query_history: true },
          ai: { answer_language: "match_question", retrieval_depth: "balanced" },
        },
        created_at: "2026-05-14T00:00:00Z",
        updated_at: null,
      },
      response: new Response(),
    });

    await getCurrentUser();

    expect(apiClientMock.GET).toHaveBeenCalledWith("/api/v1/users/me");
  });

  it("deletes the current user through the users endpoint", async () => {
    apiClientMock.DELETE.mockResolvedValueOnce({ data: undefined, response: new Response(null, { status: 204 }) });

    await deleteCurrentUser();

    expect(apiClientMock.DELETE).toHaveBeenCalledWith("/api/v1/users/me");
  });

  it("fetches and updates user preferences", async () => {
    const preferences = {
      appearance: { theme: "dark" as const },
      privacy: { share_usage_data: false, retain_query_history: true },
      ai: { answer_language: "match_question" as const, retrieval_depth: "balanced" as const },
    };
    apiClientMock.GET.mockResolvedValueOnce({ data: preferences, response: new Response() });
    apiClientMock.PATCH.mockResolvedValueOnce({ data: preferences, response: new Response() });

    await getUserPreferences();
    await updateUserPreferences(preferences);

    expect(apiClientMock.GET).toHaveBeenCalledWith("/api/v1/users/preferences");
    expect(apiClientMock.PATCH).toHaveBeenCalledWith("/api/v1/users/preferences", { body: preferences });
  });

  it("builds OAuth URLs against the API origin", () => {
    expect(oauthUrl("google")).toBe("http://localhost:8000/api/v1/auth/google");
    expect(oauthUrl("github")).toBe("http://localhost:8000/api/v1/auth/github");
  });
});
