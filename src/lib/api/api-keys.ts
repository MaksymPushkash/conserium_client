"use client";

import type { ApiKeyListResponse, CreatedApiKeyResponse } from "@/lib/types";

import { request } from "./transport";

export function listApiKeys(): Promise<ApiKeyListResponse> {
  return request<ApiKeyListResponse>("/api-keys");
}

export function createApiKey(payload: { name: string; scopes: string[] }): Promise<CreatedApiKeyResponse> {
  return request<CreatedApiKeyResponse>("/api-keys", { method: "POST", body: JSON.stringify(payload) });
}

export function revokeApiKey(id: string): Promise<void> {
  return request<void>(`/api-keys/${id}`, { method: "DELETE" });
}
