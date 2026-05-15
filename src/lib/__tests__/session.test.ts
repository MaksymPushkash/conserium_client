import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";

import { endSession, installSessionSync, invalidateSession, startSession } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

describe("session coordinator", () => {
  afterEach(() => {
    useAuthStore.getState().clearSession();
    useChatStore.getState().resetConversation();
  });

  it("clears cached data and chat state before starting a new session", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["documents"], { items: [{ id: "doc-1" }] });
    useChatStore.getState().setConversationId("chat-1");
    useChatStore.getState().addMessage({ id: "message-1", role: "user", content: "old chat" });

    startSession(queryClient, "new-access");

    expect(queryClient.getQueryData(["documents"])).toBeUndefined();
    expect(useChatStore.getState().conversationId).toBeNull();
    expect(useChatStore.getState().messages).toEqual([]);
    expect(useAuthStore.getState().accessToken).toBe("new-access");
  });

  it("clears cached data and chat state when ending a session", () => {
    const queryClient = new QueryClient();
    useAuthStore.getState().setSession("access");
    queryClient.setQueryData(["documents"], { items: [{ id: "doc-1" }] });
    useChatStore.getState().setConversationId("chat-1");
    useChatStore.getState().addMessage({ id: "message-1", role: "assistant", content: "old answer" });

    endSession(queryClient);

    expect(queryClient.getQueryData(["documents"])).toBeUndefined();
    expect(useChatStore.getState().conversationId).toBeNull();
    expect(useChatStore.getState().messages).toEqual([]);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("clears cached data and chat state when session is invalidated", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["chats"], [{ id: "chat-1" }]);
    useChatStore.getState().setConversationId("chat-1");
    useChatStore.getState().addMessage({ id: "message-1", role: "assistant", content: "old answer" });
    const uninstall = installSessionSync(queryClient);

    invalidateSession();

    expect(queryClient.getQueryData(["chats"])).toBeUndefined();
    expect(useChatStore.getState().conversationId).toBeNull();
    expect(useChatStore.getState().messages).toEqual([]);
    expect(useAuthStore.getState().accessToken).toBeNull();
    uninstall();
  });

  it("clears cached data on cross-tab session storage changes", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["documents"], { items: [{ id: "old-doc" }] });
    useChatStore.getState().setConversationId("chat-1");
    useChatStore.getState().addMessage({ id: "message-1", role: "assistant", content: "old answer" });
    const uninstall = installSessionSync(queryClient);

    window.dispatchEvent(new StorageEvent("storage", { key: "cortex-session" }));

    expect(queryClient.getQueryData(["documents"])).toBeUndefined();
    expect(useChatStore.getState().conversationId).toBeNull();
    expect(useChatStore.getState().messages).toEqual([]);
    uninstall();
  });
});
