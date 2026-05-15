"use client";

import type { QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

const SESSION_STORAGE_KEY = "cortex-session";
const SESSION_INVALIDATED_EVENT = "cortex:session-invalidated";

export function startSession(queryClient: QueryClient, accessToken: string): void {
  clearClientState(queryClient);
  useAuthStore.getState().setSession(accessToken);
}

export function endSession(queryClient: QueryClient): void {
  clearClientState(queryClient);
  useAuthStore.getState().clearSession();
}

export function invalidateSession(): void {
  useAuthStore.getState().clearSession();
  useChatStore.getState().resetConversation();
  window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
}

export function installSessionSync(queryClient: QueryClient): () => void {
  function handleSessionInvalidated() {
    clearClientState(queryClient);
  }

  function syncStoredSession(event: StorageEvent) {
    if (event.key !== SESSION_STORAGE_KEY) {
      return;
    }
    clearClientState(queryClient);
    useAuthStore.persist.rehydrate();
  }

  window.addEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated);
  window.addEventListener("storage", syncStoredSession);
  return () => {
    window.removeEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated);
    window.removeEventListener("storage", syncStoredSession);
  };
}

function clearClientState(queryClient: QueryClient): void {
  queryClient.clear();
  useChatStore.getState().resetConversation();
}
