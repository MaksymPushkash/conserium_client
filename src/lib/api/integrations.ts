"use client";

import type { IntegrationConnectUrlResponse, NotionConnection, NotionImportResponse, NotionPage, TelegramPairingCode, TelegramStatus } from "@/lib/types";
import { request } from "./transport";

export function getNotionConnection(): Promise<NotionConnection> {
  return request<NotionConnection>("/integrations/notion");
}

export function createNotionConnectUrl(): Promise<IntegrationConnectUrlResponse> {
  return request<IntegrationConnectUrlResponse>("/integrations/notion/connect-url", { method: "POST" });
}

export function updateNotionConnectionSettings(payload: {
  default_parent_page_id: string | null;
  default_parent_page_title?: string | null;
}): Promise<NotionConnection> {
  return request<NotionConnection>("/integrations/notion", { method: "PATCH", body: JSON.stringify(payload) });
}

export function searchNotionPages(params: { query?: string; limit?: number } = {}): Promise<NotionPage[]> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set("query", params.query);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return request<NotionPage[]>(`/integrations/notion/pages${query ? `?${query}` : ""}`);
}

export function importNotionPage(payload: { page_id: string; collection_id?: string | null; tags?: string[] }): Promise<NotionImportResponse> {
  return request<NotionImportResponse>("/integrations/notion/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function disconnectNotion(): Promise<void> {
  return request<void>("/integrations/notion", { method: "DELETE" });
}


export function getTelegramStatus(): Promise<TelegramStatus> {
  return request<TelegramStatus>("/integrations/telegram");
}

export function createTelegramPairingCode(): Promise<TelegramPairingCode> {
  return request<TelegramPairingCode>("/integrations/telegram/pairing-code", { method: "POST" });
}

export function revokeTelegramBinding(id: string): Promise<void> {
  return request<void>(`/integrations/telegram/bindings/${id}`, { method: "DELETE" });
}
