"use client";

import type { ChatDetailResponse, ChatListResponse, ChatSession } from "@/lib/types";
import { request } from "./transport";

export function listChats(params: { limit?: number; offset?: number } = {}): Promise<ChatListResponse> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return request<ChatListResponse>(`/chats${query ? `?${query}` : ""}`);
}

export function createChat(payload: { title: string }): Promise<ChatSession> {
  return request<ChatSession>("/chats", { method: "POST", body: JSON.stringify(payload) });
}

export function getChat(chatId: string): Promise<ChatDetailResponse> {
  return request<ChatDetailResponse>(`/chats/${chatId}`);
}

export const getChatMessages = getChat;

export function deleteChat(chatId: string): Promise<void> {
  return request<void>(`/chats/${chatId}`, { method: "DELETE" });
}
