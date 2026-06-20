"use client";

import type {
  IntegrationConnectUrlResponse,
  NotionConnection,
  NotionImportResponse,
  NotionPage,
  TelegramPairingCode,
  TelegramStatus,
} from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";
export async function getNotionConnection(): Promise<NotionConnection> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/integrations/notion"));
}

export async function createNotionConnectUrl(): Promise<IntegrationConnectUrlResponse> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/integrations/notion/connect-url"));
}

export async function updateNotionConnectionSettings(payload: {
  default_parent_page_id: string | null;
  default_parent_page_title?: string | null;
}): Promise<NotionConnection> {
  return unwrapApiResponse(
    await apiClient.PATCH("/api/v1/integrations/notion", { body: payload }),
  );
}

export async function searchNotionPages(params: { query?: string; limit?: number } = {}): Promise<NotionPage[]> {
  return unwrapApiResponse(
    await apiClient.GET("/api/v1/integrations/notion/pages", { params: { query: params } }),
  );
}

export async function importNotionPage(payload: {
  page_id: string;
  collection_id?: string | null;
  tags?: string[];
}): Promise<NotionImportResponse> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/integrations/notion/import", { body: payload }),
  );
}

export async function disconnectNotion(): Promise<void> {
  return unwrapApiResponse(await apiClient.DELETE("/api/v1/integrations/notion"));
}

export async function getTelegramStatus(): Promise<TelegramStatus> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/integrations/telegram"));
}

export async function createTelegramPairingCode(): Promise<TelegramPairingCode> {
  return unwrapApiResponse(
    await apiClient.POST("/api/v1/integrations/telegram/pairing-code"),
  );
}

export async function revokeTelegramBinding(id: string): Promise<void> {
  return unwrapApiResponse(
    await apiClient.DELETE("/api/v1/integrations/telegram/bindings/{binding_id}", {
      params: { path: { binding_id: id } },
    }),
  );
}
