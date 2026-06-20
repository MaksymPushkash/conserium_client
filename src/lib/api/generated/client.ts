"use client";

import createClient from "openapi-fetch";

import { API_BASE_URL } from "@/lib/config";
import { invalidateSession } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";

import { refreshSessionOnce } from "../session-refresh";
import { ApiError } from "../transport";
import type { components, paths } from "./v1";

export type ApiPaths = paths;
export type ApiSchema<Name extends keyof components["schemas"]> = components["schemas"][Name];

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
  fetch: generatedFetch,
});

async function generatedFetch(input: Request): Promise<Response> {
  const retryRequest = input.clone();
  const response = await fetchWithCurrentToken(input);
  if (response.status !== 401) {
    return response;
  }

  try {
    const refreshed = await refreshSessionOnce();
    useAuthStore.getState().setSession(refreshed.access_token);
    return fetchWithCurrentToken(retryRequest);
  } catch {
    invalidateSession();
    return response;
  }
}

async function fetchWithCurrentToken(input: Request): Promise<Response> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(input.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return fetch(new Request(input, { headers, credentials: "include" }));
}

export function unwrapApiResponse<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined) {
    throw new ApiError(result.response.status, result.error);
  }
  if (result.response.status === 204) {
    return undefined as T;
  }
  if (result.data === undefined) {
    throw new ApiError(result.response.status, { detail: `Request failed with status ${result.response.status}` });
  }
  return result.data;
}
