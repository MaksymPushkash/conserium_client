"use client";

import { API_V1_URL } from "@/lib/config";
import type { TokenResponse } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : `Request failed with status ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

export async function readPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.detail === "string") {
      return error.detail;
    }
    if (
      error.detail &&
      typeof error.detail === "object" &&
      "detail" in error.detail &&
      typeof (error.detail as { detail?: unknown }).detail === "string"
    ) {
      return (error.detail as { detail: string }).detail;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

async function refreshSessionRequest(refreshToken?: string): Promise<TokenResponse> {
  return request<TokenResponse>(
    "/auth/refresh",
    {
      method: "POST",
      body: refreshToken === undefined ? undefined : JSON.stringify({ refresh_token: refreshToken }),
    },
    false,
  );
}

export async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken, refreshToken, setSession, clearSession } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_V1_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && refreshToken !== null) {
    try {
      const refreshed = await refreshSessionRequest(refreshToken ?? undefined);
      setSession(refreshed.access_token, refreshed.refresh_token);
      return request<T>(path, init, false);
    } catch {
      clearSession();
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readPayload(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await readPayload(response)) as T;
}
