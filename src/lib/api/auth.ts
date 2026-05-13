"use client";

import type { TokenResponse, UserResponse } from "@/lib/types";
import { request } from "./transport";

export function register(payload: { email: string; password: string; display_name?: string | null }): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function login(payload: { email: string; password: string }): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }, false);
}

export function refreshSession(refreshToken?: string): Promise<TokenResponse> {
  return request<TokenResponse>(
    "/auth/refresh",
    {
      method: "POST",
      body: refreshToken === undefined ? undefined : JSON.stringify({ refresh_token: refreshToken }),
    },
    false,
  );
}

export function getCurrentUser(): Promise<UserResponse> {
  return request<UserResponse>("/auth/me");
}

export const fetchMe = getCurrentUser;

export function logout(refreshToken?: string | null): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
    body: refreshToken === undefined ? undefined : JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function logoutEverywhere(): Promise<void> {
  return request<void>("/auth/logout/all", { method: "POST" });
}

export const logoutAll = logoutEverywhere;

export function deleteCurrentUser(): Promise<void> {
  return request<void>("/auth/account", { method: "DELETE" });
}

export const deleteAccount = deleteCurrentUser;

export function oauthUrl(provider: "google" | "github"): string {
  return `/api/v1/auth/${provider}`;
}
