"use client";

import type { TokenResponse, UserPreferences, UserResponse } from "@/lib/types";
import { API_V1_URL } from "@/lib/config";
import { request } from "./transport";

export function register(payload: { email: string; password: string; display_name?: string | null }): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export function login(payload: { email: string; password: string }): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }, false);
}

export function refreshSession(): Promise<TokenResponse> {
  return request<TokenResponse>(
    "/auth/refresh",
    {
      method: "POST",
    },
    false,
  );
}

export function getCurrentUser(): Promise<UserResponse> {
  return request<UserResponse>("/users/me");
}

export const fetchMe = getCurrentUser;

export function getUserPreferences(): Promise<UserPreferences> {
  return request<UserPreferences>("/users/preferences");
}

export function updateUserPreferences(payload: UserPreferences): Promise<UserPreferences> {
  return request<UserPreferences>("/users/preferences", { method: "PATCH", body: JSON.stringify(payload) });
}

export function logout(): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
  });
}

export function logoutEverywhere(): Promise<void> {
  return request<void>("/auth/logout/all", { method: "POST" });
}

export const logoutAll = logoutEverywhere;

export function deleteCurrentUser(): Promise<void> {
  return request<void>("/users/me", { method: "DELETE" });
}

export const deleteAccount = deleteCurrentUser;

export function oauthUrl(provider: "google" | "github"): string {
  return `${API_V1_URL}/auth/${provider}`;
}
