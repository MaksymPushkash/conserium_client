import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteCurrentUser, getCurrentUser, getUserPreferences, oauthUrl, updateUserPreferences } from "@/lib/api/auth";

vi.mock("@/lib/api/transport", () => ({
  request: vi.fn(),
}));

import { request } from "@/lib/api/transport";

const requestMock = vi.mocked(request);

describe("auth api", () => {
  afterEach(() => {
    requestMock.mockReset();
  });

  it("fetches the current user from the users endpoint", async () => {
    requestMock.mockResolvedValueOnce({
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
    });

    await getCurrentUser();

    expect(requestMock).toHaveBeenCalledWith("/users/me");
  });

  it("deletes the current user through the users endpoint", async () => {
    requestMock.mockResolvedValueOnce(undefined);

    await deleteCurrentUser();

    expect(requestMock).toHaveBeenCalledWith("/users/me", { method: "DELETE" });
  });

  it("fetches and updates user preferences", async () => {
    const preferences = {
      appearance: { theme: "dark" as const },
      privacy: { share_usage_data: false, retain_query_history: true },
      ai: { answer_language: "match_question" as const, retrieval_depth: "balanced" as const },
    };
    requestMock.mockResolvedValueOnce(preferences).mockResolvedValueOnce(preferences);

    await getUserPreferences();
    await updateUserPreferences(preferences);

    expect(requestMock).toHaveBeenNthCalledWith(1, "/users/preferences");
    expect(requestMock).toHaveBeenNthCalledWith(2, "/users/preferences", { method: "PATCH", body: JSON.stringify(preferences) });
  });

  it("builds OAuth URLs against the API origin", () => {
    expect(oauthUrl("google")).toBe("http://localhost:8000/api/v1/auth/google");
    expect(oauthUrl("github")).toBe("http://localhost:8000/api/v1/auth/github");
  });
});
