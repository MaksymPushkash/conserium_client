"use client";

import type { ApiKeyListResponse, CreatedApiKeyResponse } from "@/lib/types";

import { apiClient, unwrapApiResponse } from "./generated/client";

export async function listApiKeys(): Promise<ApiKeyListResponse> {
  return unwrapApiResponse(await apiClient.GET("/api/v1/api-keys"));
}

export async function createApiKey(payload: { name: string; scopes: string[] }): Promise<CreatedApiKeyResponse> {
  return unwrapApiResponse(await apiClient.POST("/api/v1/api-keys", { body: payload }));
}

export async function revokeApiKey(id: string): Promise<void> {
  return unwrapApiResponse(await apiClient.DELETE("/api/v1/api-keys/{api_key_id}", { params: { path: { api_key_id: id } } }));
}
