"use client";

import { API_V1_URL } from "@/lib/config";
import { invalidateSession } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";

import { refreshSessionOnce } from "./session-refresh";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(apiErrorMessage(status, detail));
    this.status = status;
    this.detail = detail;
  }
}

function apiErrorMessage(status: number, detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail === "object" && "detail" in detail && typeof (detail as { detail?: unknown }).detail === "string") {
    return (detail as { detail: string }).detail;
  }
  return `Request failed with status ${status}`;
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

export async function authenticatedFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const { accessToken, setSession } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_V1_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, {
      detail: `Unable to reach API at ${API_V1_URL}. Check that the backend is running and that NEXT_PUBLIC_API_BASE_URL matches it.`,
    });
  }

  if (response.status === 401 && retry) {
    try {
      const refreshed = await refreshSessionOnce();
      setSession(refreshed.access_token);
      return authenticatedFetch(path, init, false);
    } catch {
      invalidateSession();
    }
  }

  return response;
}

export async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await authenticatedFetch(path, init, retry);

  if (!response.ok) {
    throw new ApiError(response.status, await readPayload(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await readPayload(response)) as T;
}
