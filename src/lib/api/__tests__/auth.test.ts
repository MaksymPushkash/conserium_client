import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteCurrentUser, getCurrentUser } from "@/lib/api/auth";

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
});
