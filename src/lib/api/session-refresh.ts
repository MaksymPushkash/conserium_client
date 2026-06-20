"use client";

import { API_V1_URL } from "@/lib/config";
import type { TokenResponse } from "@/lib/types";

let refreshRequest: Promise<TokenResponse> | null = null;

export function refreshSessionOnce(): Promise<TokenResponse> {
  if (!refreshRequest) {
    refreshRequest = refreshSession().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
}

async function refreshSession(): Promise<TokenResponse> {
  const response = await fetch(`${API_V1_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Session refresh failed");
  }
  return (await response.json()) as TokenResponse;
}
