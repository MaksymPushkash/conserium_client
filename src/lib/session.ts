"use client";

import type { QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

const SESSION_STORAGE_KEY = "conserium-session-invalidated";
const SESSION_INVALIDATED_EVENT = "conserium:session-invalidated";

export function startSession(queryClient: QueryClient, accessToken: string): void {
  clearClientState(queryClient);
  useAuthStore.getState().setSession(accessToken);
}

export function endSession(queryClient: QueryClient): void {
  clearClientState(queryClient);
  useAuthStore.getState().clearSession();
  broadcastSessionInvalidated();
}

export function invalidateSession(): void {
  useAuthStore.getState().clearSession();
  useChatStore.getState().resetConversation();
  broadcastSessionInvalidated();
}

export function installSessionSync(queryClient: QueryClient): () => void {
  function handleSessionInvalidated() {
    clearClientState(queryClient);
  }

  function syncInvalidatedSession(event: StorageEvent) {
    if (event.key !== SESSION_STORAGE_KEY) {
      return;
    }
    clearClientState(queryClient);
    useAuthStore.getState().clearSession();
  }

  window.addEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated);
  window.addEventListener("storage", syncInvalidatedSession);
  return () => {
    window.removeEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated);
    window.removeEventListener("storage", syncInvalidatedSession);
  };
}

function broadcastSessionInvalidated(): void {
  window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
  window.localStorage.setItem(SESSION_STORAGE_KEY, crypto.randomUUID());
}

function clearClientState(queryClient: QueryClient): void {
  queryClient.clear();
  useChatStore.getState().resetConversation();
}
