"use client";

import type { ChatDetailResponse, ChatListResponse, ChatSession } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";
import { normalizeChatDetail } from "./generated/normalizers";

export async function listChats(params: { limit?: number; offset?: number } = {}): Promise<ChatListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/chats", { params: { query: params } }));
}

export async function createChat(payload: { title: string }): Promise<ChatSession> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/chats", { body: payload }));
}

export async function getChat(chatId: string): Promise<ChatDetailResponse> {
  return normalizeChatDetail(
    unwrapApiResponse(await apiClient.GET("/api/v1/chats/{chat_id}", { params: { path: { chat_id: chatId } } })),
  );
}

export const getChatMessages = getChat;

export async function deleteChat(chatId: string): Promise<void> {
  return unwrapApiResponse(await apiClient.DELETE("/api/v1/chats/{chat_id}", { params: { path: { chat_id: chatId } } }));
}
